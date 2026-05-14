import { Module } from '@nestjs/common';
import { SettlementAccountsController } from './settlement-accounts.controller';
import { SettlementAccountsService } from './settlement-accounts.service';

@Module({
  controllers: [SettlementAccountsController],
  providers: [SettlementAccountsService],
  exports: [SettlementAccountsService],
})
export class SettlementAccountsModule {}
