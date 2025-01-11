import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      select: {
        id: true,
        name: true,
        status: true,
        imageUrl: true,
      },
    });
  }

  async findOne(id: number, relations: string[] = []) {
    return await this.categoryRepository.findOne({
      relations: relations,
      where: { id: id },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    let category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found !');
    }
    category = Object.assign(category, {
      ...updateCategoryDto,
    });
    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoryRepository.remove(category);
  }
}
