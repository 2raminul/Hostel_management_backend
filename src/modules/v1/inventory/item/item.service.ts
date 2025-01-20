import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor() {}

  async create(createItemDto: CreateItemDto) {}

  async findAll() {}

  async findOne(id: number) {}

  async update(id: number, updateItemDto: UpdateItemDto) {}

  async remove(id: number) {}
}
