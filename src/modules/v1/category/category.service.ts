import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RequestUser } from '../auth/type/request-user';
import { InjectConnection, Knex } from 'nestjs-knex';
import { CategoryQueryDto } from './dto/category.query.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}
  async create(dto: CreateCategoryDto, user: RequestUser) {
    try {
      const existingCategory = await this.hmDb('categories')
        .where({ name: dto.name })
        .select('id')
        .first();
      if (existingCategory) {
        throw new BadRequestException(
          'Category name already exists. Please use a different name.',
        );
      }
      await this.hmDb('categories').insert({
        name: dto.name,
        is_inventory_item: dto.isInventoryItem,
        is_sale_item: dto.isSaleItem,
        reusable: dto.reusable,
        unit: dto.unit,
        created_by: user.userId,
        updated_by: user.userId,
      });
      return { data: 'Category created successfully.' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findUnits() {
    return await this.hmDb('categories').distinct('unit').pluck('unit');
  }

  async getCategoryList(categoryQueryDto: CategoryQueryDto) {
    const { page, perPage, reusable, isInventoryItem, isSaleItem, unit, name } =
      categoryQueryDto;
    try {
      const query = this.hmDb('categories')
        .select(
          'id',
          'name',
          'reusable',
          'is_sale_item as isSaleItem',
          'is_inventory_item as isInventoryItem',
          'unit',
        )
        .whereNull('deleted_at');
      if (name) {
        query.where('name', 'LIKE', `%${name}%`);
      }
      if (reusable) {
        query.where('reusable', reusable === 'true');
      }
      if (isInventoryItem) {
        query.where('is_inventory_item', isInventoryItem === 'true');
      }
      if (isSaleItem) {
        query.where('is_sale_item', isSaleItem === 'true');
      }
      if (unit) {
        query.where('unit', unit);
      }
      const paginatedQuery = query
        .clone()
        .limit(perPage)
        .offset((page - 1) * perPage);
      const countQuery = query
        .clone()
        .clearSelect()
        .clearOrder()
        .countDistinct({ count: 'categories.id' });
      const [data, count] = await Promise.all([paginatedQuery, countQuery]);
      return { data, count: count[0].count };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }
}
