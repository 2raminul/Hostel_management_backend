import { Injectable } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor() {}

  async create(createUnitDto: CreateUnitDto) {}

  async findAll() {
    return 'all units...';
  }

  async findOne(id: number, relations: string[] = []) {}

  async update(id: number, updateUnitDto: UpdateUnitDto) {}

  async remove(id: number) {}
}
