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
import { use } from 'passport';

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
      // Below update will create a history record through the trigger written within DB.
      await this.hmDb('expenses').update({
        brand: expenseDto.brand,
        remarks: expenseDto.remarks,
        quantity: expenseDto.quantity,
        unit_price: expenseDto.unitPrice,
        total_price: expenseDto.totalPrice,
        expense_date: expenseDto.expenseDate,
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
        ...(categoryData.reusable && {
          reusable_available_count: expenseDto.quantity,
        }),
        created_by: user.userId,
        updated_by: user.userId,
      });
    }
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
      const query = this.hmDb('expenses')
        .select(
          'id',
          'category_id as categoryId',
          'category_name as categoryName',
          'brand',
          'quantity',
          'unit_price as unitPrice',
          'total_price as totalPrice',
          'expense_date as expenseDate',
        )
        .whereNull('deleted_at');
      if (categoryId) {
        query.where('category_id', queryDto.categoryId);
      }
      if (brand) {
        query.where('brand', queryDto.brand);
      }
      if (purchaseDateAfter) {
        query.where(
          'expense_date',
          '>=',
          format(purchaseDateAfter, 'yyyy-MM-dd HH:mm:ss'),
        );
      }
      if (purchaseDateBefore) {
        query.where(
          'expense_date',
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
        .countDistinct({ count: 'expenses.id' });
      const [data, count] = await Promise.all([paginatedQuery, countQuery]);
      return { data, count: count[0].count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findBrands() {
    return await this.hmDb('expenses').distinct('brand').pluck('brand');
  }

  async getExpenseDetail(id: number) {
    return await this.hmDb('expenses')
      .select(
        'id',
        'category_name as categoryName',
        'brand',
        'quantity',
        'unit_price as unitPrice',
        'total_price as totalPrice',
        'expense_date as expenseDate',
        'remarks',
      )
      .where('id', id)
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
