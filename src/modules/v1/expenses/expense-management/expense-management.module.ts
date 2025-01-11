import { Module } from '@nestjs/common';
import { ExpenseManagementController } from './expense-management.controller';
import { ExpenseManagementService } from './expense-management.service';

@Module({
  controllers: [ExpenseManagementController],
  providers: [ExpenseManagementService]
})
export class ExpenseManagementModule {}
