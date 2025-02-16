import { Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectConnection, Knex } from 'nestjs-knex';
import { InventoryQueryDto } from './dto/inventory.query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}
  create(createInventoryDto: CreateInventoryDto) {
    return 'This action adds a new inventory';
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
