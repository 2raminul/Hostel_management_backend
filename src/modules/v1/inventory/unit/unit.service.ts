import { Injectable, NotFoundException } from '@nestjs/common';
import { Unit } from './entities/unit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { Repository } from 'typeorm';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    const unit = await this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  async findAll(){
    return await this.unitRepository.find({
      select: {
        id: true,
        name: true,
        shortName: true,
        status: true,
      },
    });
  }

  async findOne(id: number, relations: string[] = []) {
    return await this.unitRepository.findOne({
      relations: relations,
      where: { id: id },
    });
  }

  async update(id: number, updateUnitDto: UpdateUnitDto){
    let unit = await this.findOne(id);
    if (!unit) {
      throw new NotFoundException('Item unit not found !');
    }
    unit = Object.assign(unit,{
      ...updateUnitDto,
    });
    return this.unitRepository.save(unit);
  }

  async remove(id: number){
    const unit = await this.findOne(id);
    return this.unitRepository.remove(unit);
  }
}
