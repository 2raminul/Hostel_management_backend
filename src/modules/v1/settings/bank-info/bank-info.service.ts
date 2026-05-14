import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@Injectable()
export class BankInfoService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  async create(dto: CreateBankDto) {
    const [id] = await this.hmDb('bank_info').insert({
      account_number: dto.accountNumber,
      status: dto.status ?? true,
    });
    return { id };
  }

  async findAll() {
    return this.hmDb('bank_info')
      .select('id', 'account_number as accountNumber', 'status')
      .whereNull('deleted_at')
      .orderBy('id', 'desc');
  }

  async findOne(id: number) {
    const record = await this.hmDb('bank_info')
      .select('id', 'account_number as accountNumber', 'status')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
    if (!record) {
      throw new NotFoundException('Bank info not found.');
    }
    return record;
  }

  async update(id: number, dto: UpdateBankDto) {
    await this.findOne(id);
    await this.hmDb('bank_info')
      .update({
        account_number: dto.accountNumber,
        status: dto.status,
      })
      .where('id', id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.hmDb('bank_info')
      .update({ deleted_at: new Date() })
      .where('id', id);
  }
}
