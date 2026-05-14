import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { IncomeModule } from '../income/income.module';

@Module({
  imports: [IncomeModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
