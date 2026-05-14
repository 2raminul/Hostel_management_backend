import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import PDFDocument from 'pdfkit';
import { IncomeService } from '../income/income.service';
import { ExpensesService } from '../expenses/expenses.service';

export type IncomeReportFilters = {
  paymentMethodId?: number;
  bookingPlatformId?: number;
  directBookingOnly?: boolean;
};

@Injectable()
export class ReportsService {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly expensesService: ExpensesService,
    @InjectConnection() private readonly hmDb: Knex,
  ) {}

  async getFinancialSummary(dateFrom?: string, dateTo?: string) {
    const [income, expense] = await Promise.all([
      this.incomeService.getSummary(dateFrom, dateTo),
      this.expensesService.getSummary(dateFrom, dateTo),
    ]);
    const net = income.totalAmount - expense.totalAmount;
    return {
      reportType: 'financial' as const,
      period: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
      income,
      expense,
      net,
    };
  }

  async getIncomeReport(
    dateFrom?: string,
    dateTo?: string,
    filters?: IncomeReportFilters,
  ) {
    const f = filters ?? {};
    const [summary, rows, paymentMethodName, bookingPlatformName] =
      await Promise.all([
        this.incomeService.getSummary(dateFrom, dateTo, f),
        this.incomeService.getIncomeReportRows(dateFrom, dateTo, f),
        f.paymentMethodId
          ? this.incomeService.getPaymentMethodName(f.paymentMethodId)
          : Promise.resolve(null),
        f.bookingPlatformId
          ? this.incomeService.getBookingPlatformName(f.bookingPlatformId)
          : Promise.resolve(null),
      ]);

    return {
      reportType: 'income' as const,
      period: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
      filters: {
        paymentMethodId: f.paymentMethodId ?? null,
        paymentMethodName,
        bookingPlatformId: f.bookingPlatformId ?? null,
        bookingPlatformName,
        directBookingOnly: !!f.directBookingOnly && !f.bookingPlatformId,
      },
      summary,
      rows,
    };
  }

  async getExpenseReport(
    dateFrom?: string,
    dateTo?: string,
    categoryId?: number,
  ) {
    const [summary, rows, categoryName] = await Promise.all([
      this.expensesService.getSummary(dateFrom, dateTo, categoryId),
      this.expensesService.getExpenseReportRows(dateFrom, dateTo, categoryId),
      categoryId
        ? this.expensesService.getCategoryName(categoryId)
        : Promise.resolve(null),
    ]);

    return {
      reportType: 'expense' as const,
      period: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
      filters: {
        categoryId: categoryId ?? null,
        categoryName,
      },
      summary,
      rows,
    };
  }

  async buildFinancialPdf(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Buffer> {
    const summary = await this.getFinancialSummary(dateFrom, dateTo);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Financial summary', { underline: true });
      doc.moveDown();
      doc
        .fontSize(10)
        .text(
          `Period: ${summary.period.dateFrom ?? '—'} to ${summary.period.dateTo ?? '—'}`,
        );
      doc.moveDown();
      doc.fontSize(12).text('Income');
      doc
        .fontSize(11)
        .text(
          `  Total amount: € ${summary.income.totalAmount.toFixed(2)}  (${summary.income.entryCount} entries)`,
        );
      doc.moveDown(0.5);
      doc.fontSize(12).text('Expenses');
      doc
        .fontSize(11)
        .text(
          `  Total amount: € ${summary.expense.totalAmount.toFixed(2)}  (${summary.expense.entryCount} entries)`,
        );
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Net (income − expenses): € ${summary.net.toFixed(2)}`);
      doc.end();
    });
  }

  async buildIncomePdf(
    dateFrom?: string,
    dateTo?: string,
    filters?: IncomeReportFilters,
  ): Promise<Buffer> {
    const data = await this.getIncomeReport(dateFrom, dateTo, filters);
    const filterLines: string[] = [];
    if (data.filters.paymentMethodName) {
      filterLines.push(`Payment: ${data.filters.paymentMethodName}`);
    }
    if (data.filters.bookingPlatformName) {
      filterLines.push(`Platform: ${data.filters.bookingPlatformName}`);
    }
    if (data.filters.directBookingOnly) {
      filterLines.push('Platform: Direct / no platform only');
    }

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 40 });
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text('Income report', { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .text(
          `Period: ${data.period.dateFrom ?? '—'} to ${data.period.dateTo ?? '—'}`,
        );
      filterLines.forEach((line) => doc.fontSize(9).text(line));
      doc.moveDown();
      doc
        .fontSize(11)
        .text(
          `Total: € ${data.summary.totalAmount.toFixed(2)} (${data.summary.entryCount} entries)`,
        );
      doc.moveDown();
      doc.fontSize(8).font('Helvetica-Bold').text('Entries');
      doc.font('Helvetica');
      for (const row of data.rows as any[]) {
        if (doc.y > 720) doc.addPage();
        const line = [
          `#${row.id}`,
          String(row.incomeDate ?? '').slice(0, 10),
          `€${Number(row.amount).toFixed(2)}`,
          `Room ${row.roomNumber ?? ''}`,
          String(row.bedLabel ?? ''),
          String(row.paymentMethod ?? ''),
          row.bookingPlatform ? String(row.bookingPlatform) : 'Direct',
          String(row.remarks ?? '').slice(0, 50),
        ].join('  |  ');
        doc.fontSize(7).text(line);
      }

      doc.end();
    });
  }

  async buildExpensePdf(
    dateFrom?: string,
    dateTo?: string,
    categoryId?: number,
  ): Promise<Buffer> {
    const data = await this.getExpenseReport(dateFrom, dateTo, categoryId);
    const filterLine = data.filters.categoryName
      ? `Category: ${data.filters.categoryName}`
      : 'Category: All';

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 40 });
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(16).text('Expense report', { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(9)
        .text(
          `Period: ${data.period.dateFrom ?? '—'} to ${data.period.dateTo ?? '—'}`,
        );
      doc.fontSize(9).text(filterLine);
      doc.moveDown();
      doc
        .fontSize(11)
        .text(
          `Total: € ${data.summary.totalAmount.toFixed(2)} (${data.summary.entryCount} entries)`,
        );
      doc.moveDown();
      doc.fontSize(8).font('Helvetica-Bold').text('Entries');
      doc.font('Helvetica');
      for (const row of data.rows as any[]) {
        if (doc.y > 720) doc.addPage();
        const line = [
          `#${row.id}`,
          String(row.categoryName ?? ''),
          String(row.brand ?? ''),
          `qty ${row.quantity ?? ''}`,
          `€${Number(row.unitPrice).toFixed(2)}`,
          `€${Number(row.totalPrice).toFixed(2)}`,
          String(row.expenseDate ?? '').slice(0, 10),
          String(row.remarks ?? '').slice(0, 40),
        ].join('  |  ');
        doc.fontSize(7).text(line);
      }

      doc.end();
    });
  }

  /** Net position per settlement account: sum(income) − sum(expenses) in period. */
  async getSettlementBalances(dateFrom?: string, dateTo?: string) {
    const accounts = await this.hmDb('settlement_accounts')
      .select('id', 'name', 'account_kind')
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('sort_order', 'asc')
      .orderBy('id', 'asc');

    const rows: Array<{
      settlementAccountId: number;
      name: string;
      accountKind: string;
      incomeTotal: number;
      expenseTotal: number;
      net: number;
    }> = [];

    for (const a of accounts as {
      id: number;
      name: string;
      account_kind: string;
    }[]) {
      let iq = this.hmDb('income_entries')
        .whereNull('deleted_at')
        .where('settlement_account_id', a.id);
      if (dateFrom) iq = iq.where('income_date', '>=', dateFrom);
      if (dateTo) iq = iq.where('income_date', '<=', dateTo);
      const ir = await iq
        .select(this.hmDb.raw('COALESCE(SUM(amount),0) as total'))
        .first();

      let eq = this.hmDb('expenses')
        .whereNull('deleted_at')
        .where('settlement_account_id', a.id);
      if (dateFrom) eq = eq.where('expense_date', '>=', dateFrom);
      if (dateTo) eq = eq.where('expense_date', '<=', dateTo);
      const er = await eq
        .select(this.hmDb.raw('COALESCE(SUM(total_price),0) as total'))
        .first();

      const incomeTotal = Number((ir as { total?: string })?.total ?? 0);
      const expenseTotal = Number((er as { total?: string })?.total ?? 0);
      rows.push({
        settlementAccountId: a.id,
        name: a.name,
        accountKind: a.account_kind,
        incomeTotal,
        expenseTotal,
        net: incomeTotal - expenseTotal,
      });
    }

    return {
      period: { dateFrom: dateFrom ?? null, dateTo: dateTo ?? null },
      accounts: rows,
    };
  }
}
