import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { ModulePermissionGuard } from '../permissions/module-permission.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';
import { SummaryQueryDto } from '@/common/dto/summary-query.dto';
import { IncomeSummaryQueryDto } from '../income/dto/income-summary-query.dto';
import { ExpenseSummaryQueryDto } from '../expenses/dto/expense-summary-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@UseGuards(AuthenticatedUserGuard, ModulePermissionGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('settlement-balances')
  @RequirePermission('reports', 'view')
  getSettlementBalances(@Query() q: SummaryQueryDto) {
    return this.reportsService.getSettlementBalances(q.dateFrom, q.dateTo);
  }

  @Get('financial')
  @RequirePermission('reports', 'view')
  getFinancial(@Query() q: SummaryQueryDto) {
    return this.reportsService.getFinancialSummary(q.dateFrom, q.dateTo);
  }

  @Get('financial/pdf')
  @RequirePermission('reports', 'view')
  async downloadFinancialPdf(
    @Query() q: SummaryQueryDto,
    @Res() res: Response,
  ) {
    const buf = await this.reportsService.buildFinancialPdf(q.dateFrom, q.dateTo);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="financial-report.pdf"',
    );
    res.send(buf);
  }

  @Get('income')
  @RequirePermission('reports', 'view')
  getIncome(@Query() q: IncomeSummaryQueryDto) {
    return this.reportsService.getIncomeReport(q.dateFrom, q.dateTo, {
      paymentMethodId: q.paymentMethodId,
      bookingPlatformId: q.bookingPlatformId,
      directBookingOnly: q.directBookingOnly,
    });
  }

  @Get('income/pdf')
  @RequirePermission('reports', 'view')
  async downloadIncomePdf(@Query() q: IncomeSummaryQueryDto, @Res() res: Response) {
    const buf = await this.reportsService.buildIncomePdf(
      q.dateFrom,
      q.dateTo,
      {
        paymentMethodId: q.paymentMethodId,
        bookingPlatformId: q.bookingPlatformId,
        directBookingOnly: q.directBookingOnly,
      },
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="income-report.pdf"',
    );
    res.send(buf);
  }

  @Get('expense')
  @RequirePermission('reports', 'view')
  getExpense(@Query() q: ExpenseSummaryQueryDto) {
    return this.reportsService.getExpenseReport(
      q.dateFrom,
      q.dateTo,
      q.categoryId,
    );
  }

  @Get('expense/pdf')
  @RequirePermission('reports', 'view')
  async downloadExpensePdf(
    @Query() q: ExpenseSummaryQueryDto,
    @Res() res: Response,
  ) {
    const buf = await this.reportsService.buildExpensePdf(
      q.dateFrom,
      q.dateTo,
      q.categoryId,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="expense-report.pdf"',
    );
    res.send(buf);
  }
}
