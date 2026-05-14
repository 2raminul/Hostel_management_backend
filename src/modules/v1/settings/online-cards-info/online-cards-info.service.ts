import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { CreateOnlineCardDto } from './dto/create-online-cards.dto';
import { UpdateBankDto } from './dto/update-online-card.dto';

@Injectable()
export class OnlineCardsInfoService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async create(dto: CreateOnlineCardDto) {
    const [id] = await this.hmDb('online_cards').insert({
      name: dto.name,
      bank_id: dto.bankId ?? null,
      card_number: dto.cardNumber ?? null,
      status: dto.status ?? true,
    });
    return { id };
  }

  async findAll() {
    return this.hmDb('online_cards as oc')
      .select(
        'oc.id',
        'oc.name',
        'oc.card_number as cardNumber',
        'oc.status',
        'bi.account_number as bankAccountNumber',
      )
      .leftJoin('bank_info as bi', 'bi.id', '=', 'oc.bank_id')
      .whereNull('oc.deleted_at')
      .orderBy('oc.id', 'desc');
  }

  async findOne(id: number) {
    const record = await this.hmDb('online_cards as oc')
      .select(
        'oc.id',
        'oc.name',
        'oc.card_number as cardNumber',
        'oc.status',
        'bi.account_number as bankAccountNumber',
      )
      .leftJoin('bank_info as bi', 'bi.id', '=', 'oc.bank_id')
      .where('oc.id', id)
      .whereNull('oc.deleted_at')
      .first();
    if (!record) {
      throw new NotFoundException('Online card not found.');
    }
    return record;
  }

  async update(id: number, dto: UpdateBankDto) {
    await this.findOne(id);
    await this.hmDb('online_cards')
      .update({
        name: dto.name,
        bank_id: dto.bankId,
        card_number: dto.cardNumber,
        status: dto.status,
      })
      .where('id', id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.hmDb('online_cards')
      .update({ deleted_at: new Date() })
      .where('id', id);
  }
}
