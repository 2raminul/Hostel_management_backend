import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Knex } from 'knex';
import type * as KnexTypes from 'knex';
import { InjectConnection, Knex as KnexConn } from 'nestjs-knex';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreateIncomeEntryDto } from './dto/create-income-entry.dto';
import { UpdateIncomeEntryDto } from './dto/update-income-entry.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { RequestUser } from '../auth/type/request-user';

@Injectable()
export class IncomeService {
  constructor(
    @InjectConnection()
    private readonly hmDb: KnexConn,
  ) {}

  // ─── Payment Methods ──────────────────────────────────────────────────

  async createPaymentMethod(dto: CreatePaymentMethodDto) {
    const [id] = await this.hmDb('payment_methods').insert({
      name: dto.name,
      description: dto.description ?? null,
      is_active: true,
    });
    return { id };
  }

  async findAllPaymentMethods() {
    return this.hmDb('payment_methods')
      .select('id', 'name', 'description', 'is_active as isActive')
      .where('is_active', true)
      .orderBy('name');
  }

  async getPaymentMethodName(id: number): Promise<string | null> {
    const row = await this.hmDb('payment_methods')
      .select('name')
      .where('id', id)
      .first();
    return row ? String((row as { name: string }).name) : null;
  }

  async getBookingPlatformName(id: number): Promise<string | null> {
    const row = await this.hmDb('booking_platforms')
      .select('name')
      .where('id', id)
      .first();
    return row ? String((row as { name: string }).name) : null;
  }

  private async ensureSettlementAccount(
    qb: KnexConn | Knex.Transaction,
    id: number,
  ) {
    const row = await qb('settlement_accounts')
      .where({ id })
      .whereNull('deleted_at')
      .where('is_active', true)
      .first();
    if (!row) {
      throw new BadRequestException('Invalid or inactive settlement account.');
    }
  }

  // ─── Income Entries ───────────────────────────────────────────────────

  async createIncomeEntry(dto: CreateIncomeEntryDto, user: RequestUser) {
    const bed = await this.hmDb('beds as b')
      .select('b.id', 'b.room_id as roomId', 'r.room_number as roomNumber')
      .join('rooms as r', 'r.id', '=', 'b.room_id')
      .where('b.id', dto.bedId)
      .whereNull('b.deleted_at')
      .first();
    if (!bed) {
      throw new NotFoundException('Bed not found.');
    }

    const trx = await this.hmDb.transaction();
    try {
      if (dto.settlementAccountId != null) {
        await this.ensureSettlementAccount(trx, dto.settlementAccountId);
      }
      const [entryId] = await trx('income_entries').insert({
        bed_id: dto.bedId,
        room_id: bed.roomId,
        payment_method_id: dto.paymentMethodId,
        booking_platform_id: dto.bookingPlatformId ?? null,
        settlement_account_id: dto.settlementAccountId ?? null,
        amount: dto.amount,
        income_date: dto.incomeDate,
        remarks: dto.remarks ?? null,
        created_by: user.userId,
        updated_by: user.userId,
      });

      await this.recalculateDailySummary(trx, bed.roomId, dto.incomeDate);
      await trx.commit();
      return { id: entryId };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getIncomeList(queryDto: IncomeQueryDto) {
    const { page = 1, perPage = 10, roomId, bedId, dateFrom, dateTo } = queryDto;

    const query = this.hmDb('income_entries as ie')
      .select(
        'ie.id',
        'ie.amount',
        'ie.income_date as incomeDate',
        'ie.remarks',
        'b.bed_label as bedLabel',
        'r.room_number as roomNumber',
        'pm.name as paymentMethod',
        'bp.name as bookingPlatform',
        'sa.name as settlementAccount',
        'u.name as createdBy',
      )
      .join('beds as b', 'b.id', '=', 'ie.bed_id')
      .join('rooms as r', 'r.id', '=', 'ie.room_id')
      .join('payment_methods as pm', 'pm.id', '=', 'ie.payment_method_id')
      .leftJoin('booking_platforms as bp', 'bp.id', '=', 'ie.booking_platform_id')
      .leftJoin('users as u', 'u.id', '=', 'ie.created_by')
      .leftJoin(
        'settlement_accounts as sa',
        'sa.id',
        '=',
        'ie.settlement_account_id',
      )
      .whereNull('ie.deleted_at');

    if (roomId) query.where('ie.room_id', roomId);
    if (bedId) query.where('ie.bed_id', bedId);
    if (dateFrom) query.where('ie.income_date', '>=', dateFrom);
    if (dateTo) query.where('ie.income_date', '<=', dateTo);

    const paginatedQuery = query.clone().limit(perPage).offset((page - 1) * perPage).orderBy('ie.income_date', 'desc');
    const countQuery = query.clone().clearSelect().clearOrder().countDistinct({ count: 'ie.id' });

    const [data, count] = await Promise.all([paginatedQuery, countQuery]);
    return { data, count: count[0].count };
  }

  /** Optional filters for summary / reports (payment + platform). */
  applyIncomeReportFilters(
    qb: Knex.QueryBuilder,
    dateFrom?: string,
    dateTo?: string,
    filters?: {
      paymentMethodId?: number;
      bookingPlatformId?: number;
      directBookingOnly?: boolean;
    },
  ) {
    if (dateFrom) qb.where('ie.income_date', '>=', dateFrom);
    if (dateTo) qb.where('ie.income_date', '<=', dateTo);
    if (filters?.paymentMethodId) {
      qb.where('ie.payment_method_id', filters.paymentMethodId);
    }
    if (filters?.bookingPlatformId != null) {
      qb.where('ie.booking_platform_id', filters.bookingPlatformId);
    } else if (filters?.directBookingOnly) {
      qb.whereNull('ie.booking_platform_id');
    }
  }

  async getSummary(
    dateFrom?: string,
    dateTo?: string,
    filters?: {
      paymentMethodId?: number;
      bookingPlatformId?: number;
      directBookingOnly?: boolean;
    },
  ) {
    const row = await this.hmDb('income_entries as ie')
      .whereNull('ie.deleted_at')
      .modify((qb) =>
        this.applyIncomeReportFilters(qb, dateFrom, dateTo, filters),
      )
      .select(
        this.hmDb.raw('COALESCE(SUM(ie.amount), 0) as totalAmount'),
        this.hmDb.raw('COUNT(ie.id) as entryCount'),
      )
      .first();
    return {
      totalAmount: Number((row as any)?.totalAmount ?? 0),
      entryCount: Number((row as any)?.entryCount ?? 0),
    };
  }

  /** All matching rows for income reports / PDF (no pagination). */
  async getIncomeReportRows(
    dateFrom?: string,
    dateTo?: string,
    filters?: {
      paymentMethodId?: number;
      bookingPlatformId?: number;
      directBookingOnly?: boolean;
    },
  ) {
    return this.hmDb('income_entries as ie')
      .select(
        'ie.id',
        'ie.amount',
        'ie.income_date as incomeDate',
        'ie.remarks',
        'b.bed_label as bedLabel',
        'r.room_number as roomNumber',
        'pm.name as paymentMethod',
        'bp.name as bookingPlatform',
        'sa.name as settlementAccount',
      )
      .join('beds as b', 'b.id', '=', 'ie.bed_id')
      .join('rooms as r', 'r.id', '=', 'ie.room_id')
      .join('payment_methods as pm', 'pm.id', '=', 'ie.payment_method_id')
      .leftJoin('booking_platforms as bp', 'bp.id', '=', 'ie.booking_platform_id')
      .leftJoin(
        'settlement_accounts as sa',
        'sa.id',
        '=',
        'ie.settlement_account_id',
      )
      .whereNull('ie.deleted_at')
      .modify((qb) =>
        this.applyIncomeReportFilters(qb, dateFrom, dateTo, filters),
      )
      .orderBy('ie.income_date', 'desc')
      .orderBy('ie.id', 'desc');
  }

  async findOneIncomeEntry(id: number) {
    const entry = await this.hmDb('income_entries as ie')
      .select(
        'ie.id',
        'ie.amount',
        'ie.income_date as incomeDate',
        'ie.remarks',
        'ie.bed_id as bedId',
        'ie.room_id as roomId',
        'ie.payment_method_id as paymentMethodId',
        'ie.booking_platform_id as bookingPlatformId',
        'ie.settlement_account_id as settlementAccountId',
        'b.bed_label as bedLabel',
        'r.room_number as roomNumber',
        'sa.name as settlementAccountName',
      )
      .join('beds as b', 'b.id', '=', 'ie.bed_id')
      .join('rooms as r', 'r.id', '=', 'ie.room_id')
      .leftJoin(
        'settlement_accounts as sa',
        'sa.id',
        '=',
        'ie.settlement_account_id',
      )
      .where('ie.id', id)
      .whereNull('ie.deleted_at')
      .first();
    if (!entry) {
      throw new NotFoundException('Income entry not found.');
    }
    return entry;
  }

  async updateIncomeEntry(id: number, dto: UpdateIncomeEntryDto, user: RequestUser) {
    const existing = await this.findOneIncomeEntry(id);
    const trx = await this.hmDb.transaction();
    try {
      if (dto.settlementAccountId !== undefined && dto.settlementAccountId != null) {
        await this.ensureSettlementAccount(trx, dto.settlementAccountId);
      }
      await trx('income_entries')
        .update({
          bed_id: dto.bedId ?? existing.bedId,
          payment_method_id: dto.paymentMethodId ?? existing.paymentMethodId,
          booking_platform_id: dto.bookingPlatformId ?? existing.bookingPlatformId,
          settlement_account_id:
            dto.settlementAccountId !== undefined
              ? (dto.settlementAccountId ?? null)
              : ((existing as { settlementAccountId?: number | null })
                  .settlementAccountId ?? null),
          amount: dto.amount ?? existing.amount,
          income_date: dto.incomeDate ?? existing.incomeDate,
          remarks: dto.remarks ?? existing.remarks,
          updated_by: user.userId,
        })
        .where('id', id);

      // Recalculate for old and potentially new date
      await this.recalculateDailySummary(trx, existing.roomId, existing.incomeDate);
      if (dto.incomeDate && dto.incomeDate !== existing.incomeDate) {
        await this.recalculateDailySummary(trx, existing.roomId, dto.incomeDate);
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async removeIncomeEntry(id: number, user: RequestUser) {
    const existing = await this.findOneIncomeEntry(id);
    const trx = await this.hmDb.transaction();
    try {
      await trx('income_entries')
        .update({ deleted_at: new Date(), updated_by: user.userId })
        .where('id', id);
      await this.recalculateDailySummary(trx, existing.roomId, existing.incomeDate);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // ─── Daily Summary ────────────────────────────────────────────────────

  async getDailySummary(date?: string, roomId?: number) {
    const query = this.hmDb('daily_income_summary as ds')
      .select(
        'ds.id',
        'ds.summary_date as date',
        'ds.total_amount as totalAmount',
        'ds.total_entries as totalEntries',
        'r.room_number as roomNumber',
        'r.id as roomId',
      )
      .join('rooms as r', 'r.id', '=', 'ds.room_id')
      .orderBy('ds.summary_date', 'desc');

    if (date) query.where('ds.summary_date', date);
    if (roomId) query.where('ds.room_id', roomId);

    return query;
  }

  // Called from inventory sale (Phase 1.3)
  async addIncomeBySale(
    bedId: number,
    paymentMethodId: number,
    amount: number,
    incomeDate: string,
    remarks: string,
    userId: number,
    trx: KnexTypes.Knex.Transaction,
  ) {
    const bed = await trx('beds as b')
      .select('b.id', 'b.room_id as roomId')
      .where('b.id', bedId)
      .whereNull('b.deleted_at')
      .first();
    if (!bed) throw new BadRequestException('Bed not found for sale income.');

    await trx('income_entries').insert({
      bed_id: bedId,
      room_id: bed.roomId,
      payment_method_id: paymentMethodId,
      settlement_account_id: null,
      amount,
      income_date: incomeDate,
      remarks,
      created_by: userId,
      updated_by: userId,
    });
    await this.recalculateDailySummary(trx, bed.roomId, incomeDate);
  }

  private async recalculateDailySummary(
    trx: KnexTypes.Knex.Transaction,
    roomId: number,
    date: string,
  ) {
    const [result] = await trx('income_entries')
      .where({ room_id: roomId, income_date: date })
      .whereNull('deleted_at')
      .sum({ totalAmount: 'amount' })
      .count({ totalEntries: 'id' });

    const totalAmount = Number(result.totalAmount) || 0;
    const totalEntries = Number(result.totalEntries) || 0;

    const existing = await trx('daily_income_summary')
      .where({ room_id: roomId, summary_date: date })
      .first();

    if (existing) {
      await trx('daily_income_summary')
        .update({ total_amount: totalAmount, total_entries: totalEntries })
        .where({ room_id: roomId, summary_date: date });
    } else if (totalEntries > 0) {
      await trx('daily_income_summary').insert({
        room_id: roomId,
        summary_date: date,
        total_amount: totalAmount,
        total_entries: totalEntries,
      });
    }
  }
}
