import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectConnection, Knex } from 'nestjs-knex';
import { InventoryQueryDto } from './dto/inventory.query.dto';
import { RequestUser } from '../auth/type/request-user';

@Injectable()
export class InventoryService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
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
        ? inventoryRecord.reusableAvailableCount || 0 + dto.quantity
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

  async getInvenoryList(queryDto: InventoryQueryDto) {
    const { page, perPage, categoryId, brand } = queryDto;
    try {
      const query = this.hmDb('inventory_items')
        .select(
          'id',
          'category_id as categoryId',
          'category_name as categoryName',
          'brand',
          'in_stock_count as inStockCount',
          'reusable_available_count as reusableCount',
        )
        .whereNull('deleted_at');
      if (categoryId) {
        query.where('category_id', queryDto.categoryId);
      }
      if (brand) {
        query.where('brand', queryDto.brand);
      }
      const paginatedQuery = query
        .clone()
        .limit(perPage)
        .offset((page - 1) * perPage);
      const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .countDistinct({ count: 'inventory_items.id' });
      const [data, count] = await Promise.all([paginatedQuery, countQuery]);
      return { data, count: count[0].count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }

  async findBrands() {
    return await this.hmDb('inventory_items').distinct('brand').pluck('brand');
  }
}
