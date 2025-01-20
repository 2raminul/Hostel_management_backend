import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor() {}

  async create(createCategoryDto: CreateCategoryDto) {}

  async findAll() {}

  async findOne(id: number, relations: string[] = []) {}

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {}

  async remove(id: number) {}
}
