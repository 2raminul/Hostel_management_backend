import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { CategoryModule } from '../category/category.module';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item]), CategoryModule, UnitModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
