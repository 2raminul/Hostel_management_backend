import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import type * as KnexTypes from 'knex';
import { InjectConnection, Knex as KnexConn } from 'nestjs-knex';
import { InventoryQueryDto } from './dto/inventory.query.dto';
import { RequestUser } from '../auth/type/request-user';
import { InventoryUsageDto } from './dto/usage-inventory.dto';
import { InventorySaleDto } from './dto/sale-inventory.dto';
import { ReusableInventoryUpdateDto } from './dto/reusable-inventory-update.dto';
import { ReusableItemStateEnum } from './enums/reusable-item-state.enum';
import { IncomeService } from '../income/income.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectConnection()
    private readonly hmDb: KnexConn,
    private readonly incomeService: IncomeService,
  ) {}
  async addToInventory(dto: CreateInventoryDto, user: RequestUser) {
    try {
      const [categoryRecord, inventoryRecord] = await Promise.all([
        this.hmDb('categories')
          .select('id', 'name', 'reusable')
          .where('id', dto.categoryId)
          .first(),
        this.hmDb('inventory_items')
          .select(
            'id',
            'in_stock_count as inStockCount',
            'reusable_available_count as reusableAvailableCount',
          )
          .where({ category_id: dto.categoryId, brand: dto.brand })
          .first(),
      ]);
      if (!categoryRecord) {
        throw new BadRequestException();
      }
      if (!inventoryRecord) {
        await this.hmDb('inventory_items').insert({
          category_id: dto.categoryId,
          category_name: categoryRecord.name,
          brand: dto.brand,
          in_stock_count: dto.quantity,
          ...(categoryRecord.reusable && {
            reusable_available_count: dto.quantity,
          }),
          remarks: dto.remarks,
          created_by: user.userId,
          updated_by: user.userId,
        });
        return;
      }
      const toBeInStockCount = inventoryRecord.inStockCount + dto.quantity;
      const reusableLatestCount = categoryRecord.reusable
        ? (inventoryRecord.reusableAvailableCount || 0) + dto.quantity
        : null;
      await this.hmDb('inventory_items')
        .update({
          in_stock_count: toBeInStockCount,
          ...(categoryRecord.reusable && {
            reusable_available_count: reusableLatestCount,
          }),
          remarks: dto.remarks,
          updated_by: user.userId,
        })
        .where('id', inventoryRecord.id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async decreaseDueToUsage(dto: InventoryUsageDto, user: RequestUser) {
    try {
      const inventoryItemRecord = await this.hmDb('inventory_items as ii')
        .select(
          'ii.id',
          'ii.category_id as categoryId',
          'categories.name as categoryName',
          'categories.reusable as isReusableItem',
          'ii.in_stock_count as inStockCount',
          'categories.is_sale_item as isSaleItem',
        )
        .where('ii.id', dto.inventoryItemId)
        .whereNull('ii.deleted_at')
        .join('categories', 'categories.id', '=', 'ii.category_id')
        .first();
      if (!inventoryItemRecord) {
        throw new NotFoundException();
      }
      if (inventoryItemRecord.isReusableItem) {
        throw new BadRequestException('Item is reusable.');
      }
      if (inventoryItemRecord.isSaleItem) {
        throw new BadRequestException('Item is to be sold.');
      }
      if (inventoryItemRecord.inStockCount < dto.usageCount) {
        throw new BadRequestException('Not enough items in stock');
      }
      const remainingCount = inventoryItemRecord.inStockCount - dto.usageCount;
      await this.hmDb('inventory_items')
        .update({
          remarks: dto.remarks,
          in_stock_count: remainingCount,
          updated_by: user.userId,
        })
        .where('id', dto.inventoryItemId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async decreaseDueToSale(dto: InventorySaleDto, user: RequestUser) {
    try {
      const inventoryItemRecord = await this.hmDb('inventory_items as ii')
        .select(
          'ii.id',
          'ii.category_id as categoryId',
          'categories.name as categoryName',
          'categories.reusable as isReusableItem',
          'ii.in_stock_count as inStockCount',
          'categories.is_sale_item as isSaleItem',
        )
        .where('ii.id', dto.inventoryItemId)
        .whereNull('ii.deleted_at')
        .join('categories', 'categories.id', '=', 'ii.category_id')
        .first();
      if (!inventoryItemRecord) {
        throw new NotFoundException();
      }
      if (inventoryItemRecord.isReusableItem) {
        throw new BadRequestException('Item is reusable.');
      }
      if (inventoryItemRecord.inStockCount < dto.sellCount) {
        throw new BadRequestException('Not enough items in stock');
      }
      const remainingCount = inventoryItemRecord.inStockCount - dto.sellCount;
      const totalSaleAmount = dto.saleUnitPrice * dto.sellCount;
      const trx = await this.hmDb.transaction();
      try {
        await trx('inventory_items')
          .update({
            remarks: dto.remarks,
            in_stock_count: remainingCount,
            updated_by: user.userId,
          })
          .where('id', dto.inventoryItemId);
        await this.addIncomeBySale(dto, user, totalSaleAmount, trx);
        await trx.commit();
      } catch (error) {
        await trx.rollback();
        Logger.error(error);
        throw new InternalServerErrorException();
      }
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async updateReusableCount(
    dto: ReusableInventoryUpdateDto,
    user: RequestUser,
  ) {
    try {
      const inventoryItemRecord = await this.hmDb('inventory_items as ii')
        .select(
          'ii.id',
          'ii.category_id as categoryId',
          'categories.name as categoryName',
          'categories.reusable as isReusableItem',
          'ii.in_stock_count as inStockCount',
          'ii.reusable_available_count as reusableCount',
          'categories.is_sale_item as isSaleItem',
        )
        .where('ii.id', dto.inventoryItemId)
        .whereNull('ii.deleted_at')
        .join('categories', 'categories.id', '=', 'ii.category_id')
        .first();
      if (!inventoryItemRecord) {
        throw new NotFoundException();
      }
      if (!inventoryItemRecord.isReusableItem) {
        throw new BadRequestException('Item is not reusable.');
      }
      let reusableCount = 0;
      if (dto.stateUpdateType == ReusableItemStateEnum.PUT_IN_RESERVE) {
        reusableCount = inventoryItemRecord.reusableCount + dto.count;
        if (reusableCount > inventoryItemRecord.inStockCount) {
          throw new BadRequestException(
            'Reusable item count exceeds the amount available in stock.',
          );
        }
      } else if (dto.stateUpdateType == ReusableItemStateEnum.PUT_TO_USE) {
        reusableCount = inventoryItemRecord.reusableCount - dto.count;
        if (reusableCount < 0) {
          throw new BadRequestException('Not enough items in stock.');
        }
      }
      await this.hmDb('inventory_items')
        .update({
          remarks: dto.remarks,
          reusable_available_count: reusableCount,
          updated_by: user.userId,
        })
        .where('id', dto.inventoryItemId);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  async addIncomeBySale(
    dto: InventorySaleDto,
    user: RequestUser,
    totalAmount: number,
    trx: KnexTypes.Knex.Transaction,
  ) {
    const today = new Date().toISOString().split('T')[0];
    // Default payment method id=1 (Cash); dto can be extended to carry paymentMethodId/bedId if needed
    const paymentMethodId = (dto as any).paymentMethodId || 1;
    const bedId = (dto as any).bedId || null;
    if (!bedId) {
      // No bed context — skip income recording for non-bed sales
      return;
    }
    await this.incomeService.addIncomeBySale(
      bedId,
      paymentMethodId,
      totalAmount,
      today,
      dto.remarks,
      user.userId,
      trx,
    );
  }

  async getInventoryItemDetail(id: number) {
    try {
      const inventoryItem = await this.hmDb('inventory_items as ii')
        .select(
          'ii.id',
          'ii.brand',
          'ii.category_id as categoryId',
          'ii.in_stock_count as inStockCount',
          'ii.reusable_available_count as reusableCount',
          'categories.name as categoryName',
          'categories.is_sale_item as isSaleItem',
          'categories.reusable as isReusableItem',
          'categories.unit as unit',
        )
        .join('categories', 'categories.id', '=', 'ii.category_id')
        .where('ii.id', id)
        .whereNull('ii.deleted_at')
        .first();
      if (!inventoryItem) {
        throw new NotFoundException();
      }
      return inventoryItem;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getInvenoryList(queryDto: InventoryQueryDto) {
    const { page, perPage, categoryId, brand } = queryDto;
    try {
      const query = this.hmDb('inventory_items as ii')
        .select(
          'ii.id',
          'ii.category_id as categoryId',
          'categories.name as categoryName',
          'ii.brand',
          'ii.in_stock_count as inStockCount',
          'ii.reusable_available_count as reusableCount',
          'categories.is_sale_item as isSaleItem',
          'categories.reusable as isReusableItem',
          'categories.unit as unit',
        )
        .join('categories', 'categories.id', '=', 'ii.category_id')
        .whereNull('ii.deleted_at');
      if (categoryId) {
        query.where('ii.category_id', queryDto.categoryId);
      }
      if (brand) {
        query.where('ii.brand', queryDto.brand);
      }
      const paginatedQuery = query
        .clone()
        .limit(perPage)
        .offset((page - 1) * perPage);
      const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .countDistinct({ count: 'ii.id' });
      const [data, count] = await Promise.all([paginatedQuery, countQuery]);
      return { data, count: count[0].count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }

  async findBrands() {
    return await this.hmDb('inventory_items').distinct('brand').pluck('brand');
  }
}
