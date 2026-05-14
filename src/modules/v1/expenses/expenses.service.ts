import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InjectConnection, Knex } from 'nestjs-knex';
import { RequestUser } from '../auth/type/request-user';
import { ExpenseQueryDto } from './dto/expense.query.dto';
import { format } from 'date-fns';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async addExpense(expenseDto: CreateExpenseDto, user: RequestUser) {
    const categoryData = await this.hmDb('categories')
      .select('id', 'name', 'is_inventory_item as isInventoryItem', 'reusable')
      .where('id', expenseDto.categoryId)
      .first();
    if (!categoryData) {
      throw new BadRequestException();
    }
    if (expenseDto.settlementAccountId != null) {
      await this.ensureSettlementAccount(expenseDto.settlementAccountId);
    }
    const trx = await this.hmDb.transaction();
    try {
      if (categoryData.isInventoryItem) {
        await this.addToInventory(categoryData, expenseDto, user, trx);
      }
      await trx('expenses').insert({
        category_id: expenseDto.categoryId,
        category_name: categoryData.name,
        brand: expenseDto.brand,
        quantity: expenseDto.quantity,
        unit_price: expenseDto.unitPrice,
        total_price: expenseDto.totalPrice,
        expense_date: expenseDto.expenseDate,
        settlement_account_id: expenseDto.settlementAccountId ?? null,
        created_by: user.userId,
        updated_by: user.userId,
        ...(expenseDto.remarks && { remarks: expenseDto.remarks }),
      });
      await trx.commit();
    } catch (error) {
      trx.rollback();
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  private async ensureSettlementAccount(id: number) {
    const row = await this.hmDb('settlement_accounts')
      .where({ id })
      .whereNull('deleted_at')
      .where('is_active', true)
      .first();
    if (!row) {
      throw new BadRequestException('Invalid or inactive settlement account.');
    }
  }

  async editExpense(expenseDto: UpdateExpenseDto, user: RequestUser) {
    const expenseRecord = await this.hmDb('expenses')
      .select(
        'id',
        'brand',
        'category_id',
        'quantity',
        'unit_price',
        'total_price',
        'expense_date',
      )
      .where('id', expenseDto.id)
      .first();

    if (!expenseRecord) {
      throw new BadRequestException();
    }
    try {
      if (expenseDto.settlementAccountId != null) {
        await this.ensureSettlementAccount(expenseDto.settlementAccountId);
      }
      // Below update will create a history record through the trigger written within DB.
      await this.hmDb('expenses').update({
        brand: expenseDto.brand,
        remarks: expenseDto.remarks,
        quantity: expenseDto.quantity,
        unit_price: expenseDto.unitPrice,
        total_price: expenseDto.totalPrice,
        expense_date: expenseDto.expenseDate,
        ...(expenseDto.settlementAccountId !== undefined && {
          settlement_account_id: expenseDto.settlementAccountId ?? null,
        }),
        updated_by: user.userId,
      });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async addToInventory(
    categoryData: any,
    expenseDto: CreateExpenseDto,
    user: RequestUser,
    trx: any,
  ) {
    const existingInventoryRecord = await this.hmDb('inventory_items')
      .where('category_id', expenseDto.categoryId)
      .where('brand', expenseDto.brand)
      .select(
        'id',
        'in_stock_count as inStockCount',
        'reusable_available_count as reusableAvailableCount',
      )
      .first();
    if (existingInventoryRecord) {
      const currentlyAvailable = existingInventoryRecord.inStockCount;
      const updatedStockCount = currentlyAvailable + expenseDto.quantity;
      const currentlyReusableAvailableCount = categoryData.reusable
        ? existingInventoryRecord.reusableAvailableCount
        : null;

      await trx('inventory_items').update({
        in_stock_count: updatedStockCount,
        updated_by: user.userId,
        ...(categoryData.reusable && {
          reusable_available_count:
            currentlyReusableAvailableCount + expenseDto.quantity,
        }),
      });
    } else {
      await trx('inventory_items').insert({
        category_id: categoryData.id,
        category_name: categoryData.name,
        in_stock_count: expenseDto.quantity,
        brand: expenseDto.brand,
        ...(categoryData.reusable && {
          reusable_available_count: expenseDto.quantity,
        }),
        created_by: user.userId,
        updated_by: user.userId,
      });
    }
  }

  async getCategoryName(id: number): Promise<string | null> {
    const row = await this.hmDb('categories')
      .select('name')
      .where('id', id)
      .first();
    return row ? String((row as { name: string }).name) : null;
  }

  async getExpenseList(queryDto: ExpenseQueryDto) {
    const {
      page,
      perPage,
      categoryId,
      brand,
      purchaseDateAfter,
      purchaseDateBefore,
    } = queryDto;
    try {
      const query = this.hmDb('expenses as e')
        .select(
          'e.id',
          'e.category_id as categoryId',
          'e.category_name as categoryName',
          'e.brand',
          'e.quantity',
          'e.unit_price as unitPrice',
          'e.total_price as totalPrice',
          'e.expense_date as expenseDate',
          'sa.name as settlementAccount',
        )
        .leftJoin(
          'settlement_accounts as sa',
          'sa.id',
          '=',
          'e.settlement_account_id',
        )
        .whereNull('e.deleted_at');
      if (categoryId) {
        query.where('e.category_id', queryDto.categoryId);
      }
      if (brand) {
        query.where('e.brand', queryDto.brand);
      }
      if (purchaseDateAfter) {
        query.where(
          'e.expense_date',
          '>=',
          format(purchaseDateAfter, 'yyyy-MM-dd HH:mm:ss'),
        );
      }
      if (purchaseDateBefore) {
        query.where(
          'e.expense_date',
          '<=',
          format(purchaseDateBefore, 'yyyy-MM-dd HH:mm:ss'),
        );
      }
      const paginatedQuery = query
        .clone()
        .limit(perPage)
        .offset((page - 1) * perPage);
      const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .countDistinct({ count: 'e.id' });
      const [data, count] = await Promise.all([paginatedQuery, countQuery]);
      return { data, count: count[0].count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSummary(dateFrom?: string, dateTo?: string, categoryId?: number) {
    const row = await this.hmDb('expenses as e')
      .whereNull('e.deleted_at')
      .modify((qb) => {
        if (dateFrom) qb.where('e.expense_date', '>=', dateFrom);
        if (dateTo) qb.where('e.expense_date', '<=', dateTo);
        if (categoryId) qb.where('e.category_id', categoryId);
      })
      .select(
        this.hmDb.raw('COALESCE(SUM(e.total_price), 0) as totalAmount'),
        this.hmDb.raw('COUNT(e.id) as entryCount'),
      )
      .first();
    return {
      totalAmount: Number((row as any)?.totalAmount ?? 0),
      entryCount: Number((row as any)?.entryCount ?? 0),
    };
  }

  /** All matching rows for expense reports / PDF (no pagination). */
  async getExpenseReportRows(
    dateFrom?: string,
    dateTo?: string,
    categoryId?: number,
  ) {
    return this.hmDb('expenses as e')
      .select(
        'e.id',
        'e.category_id as categoryId',
        'e.category_name as categoryName',
        'e.brand',
        'e.quantity',
        'e.unit_price as unitPrice',
        'e.total_price as totalPrice',
        'e.expense_date as expenseDate',
        'e.remarks',
      )
      .whereNull('e.deleted_at')
      .modify((qb) => {
        if (dateFrom) qb.where('e.expense_date', '>=', dateFrom);
        if (dateTo) qb.where('e.expense_date', '<=', dateTo);
        if (categoryId) qb.where('e.category_id', categoryId);
      })
      .orderBy('e.expense_date', 'desc')
      .orderBy('e.id', 'desc');
  }

  async getExpenseDetail(id: number) {
    return await this.hmDb('expenses as e')
      .select(
        'e.id',
        'e.category_name as categoryName',
        'e.brand',
        'e.quantity',
        'e.unit_price as unitPrice',
        'e.total_price as totalPrice',
        'e.expense_date as expenseDate',
        'e.remarks',
        'e.settlement_account_id as settlementAccountId',
        'sa.name as settlementAccountName',
      )
      .leftJoin(
        'settlement_accounts as sa',
        'sa.id',
        '=',
        'e.settlement_account_id',
      )
      .where('e.id', id)
      .first();
  }

  async getExpenseHistory(id: number) {
    const data = await this.hmDb('expenses_history as eh')
      .select(
        'eh.id',
        'eh.category_id as categoryId',
        'eh.category_name as categoryName',
        'eh.brand',
        'eh.quantity',
        'eh.unit_price as unitPrice',
        'eh.total_price as totalPrice',
        'eh.remarks',
        'eh.expense_date as expenseDate',
        'eh.updated_at as version',
        'us.name as updatedBy',
      )
      .join('users as us', 'us.id', '=', 'eh.updated_by')
      .orderBy('eh.id', 'desc')
      .where('expenses_id', id);
    return { data: data || [], count: data?.length || 0 };
  }
}
