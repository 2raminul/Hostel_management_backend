import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('unit')
@ApiTags('Unit')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  async create(@Body() createUnitDto: CreateUnitDto) {
    return await this.unitService.create(createUnitDto);
  }

  @Get()
  async findAll(){
    return await this.unitService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string){
    return await this.unitService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    console.log('given id', id);
    console.log('unit dto', UpdateUnitDto);
    return await this.unitService.update(+id, updateUnitDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string){
    return await this.unitService.remove(+id);
  }
}
