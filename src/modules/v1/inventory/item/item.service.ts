import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly categoryService: CategoryService,
    private readonly unitService: UnitService,
  ) { }

  async create(createItemDto: CreateItemDto) {
    // Validate category existence
    console.log('item to be add', createItemDto);
    const category = await this.categoryService.findOne(
      createItemDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createItemDto.categoryId} not found`,
      );
    }

    // Validate unit existence
    const unit = await this.unitService.findOne(createItemDto.unitId);
    if (!unit) {
      throw new NotFoundException(
        `unit with ID ${createItemDto.unitId} not found`,
      );
    }

    // Create the item
    const item = this.itemRepository.create({
      ...createItemDto,
      category,
      unit,
    });
    // Assign the category entity
    return await this.itemRepository.save(item);

    // const product = this.itemRepository.create(createItemDto);
    // return this.itemRepository.save(product);
  }

  async findAll() {
    //const { page = 1, perPage = 10, order = {} } = query;
    // const queryFilters = await this.customFilter(filters);
    // console.log('filters', queryFilters);

    const [results, total] = await this.itemRepository.findAndCount({
      relations: ['category', 'unit'],
      // where: {
      //   ...queryFilters,
      // },
      ///take: Number(perPage),
      //skip: (Number(page) - 1) * Number(perPage),
      //order: order,
    });
    console.log('results item', results);
    return {
      results
    };
  }

  async findOne(id: number) {
    const item = await this.itemRepository.findOne({
      relations: ['category', 'unit'],
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    // let product = await this.findOne(id);
    // if (!product) {
    //   throw new NotFoundException('Product not found !');
    // }
    // product = Object.assign(product, {
    //   ...updateItemDto,
    // });

    // if (updateItemDto.categoryId) {
    //   product.category = await this.categoryService.findOne(
    //     updateItemDto.categoryId,
    //   );
    // }

    // return this.itemRepository.save(product);
    const item = await this.findOne(id);

    // Update category if provided
    if (updateItemDto.categoryId) {
      const category = await this.categoryService.findOne(
        updateItemDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateItemDto.categoryId} not found`,
        );
      }
      item.category = category;

      // Update unit if provided
      if (updateItemDto.unitId) {
        const unit = await this.unitService.findOne(updateItemDto.unitId);
        if (!unit) {
          throw new NotFoundException(
            `unit with ID ${updateItemDto.unitId} not found`,
          );
        }
        item.unit = unit;
      }

      // Update other fields
      Object.assign(item, { ...updateItemDto });
      return this.itemRepository.save(item);
    }
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return this.itemRepository.remove(item);
  }

}
