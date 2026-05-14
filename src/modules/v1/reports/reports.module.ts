import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { IncomeModule } from '../income/income.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { ModulePermissionGuard } from '../permissions/module-permission.guard';

@Module({
  imports: [IncomeModule, ExpensesModule, PermissionsModule],
  controllers: [ReportsController],
  providers: [ReportsService, ModulePermissionGuard],
})
export class ReportsModule {}
