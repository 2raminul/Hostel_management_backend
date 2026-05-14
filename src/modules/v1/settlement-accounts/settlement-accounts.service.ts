import { Injectable } from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';

@Injectable()
export class SettlementAccountsService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async findAllActive() {
    return this.hmDb('settlement_accounts')
      .select(
        'id',
        'name',
        'account_kind as accountKind',
        'bank_info_id as bankInfoId',
        'sort_order as sortOrder',
        'is_active as isActive',
      )
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('sort_order', 'asc')
      .orderBy('id', 'asc');
  }
}
