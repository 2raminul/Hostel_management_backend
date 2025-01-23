import { Module } from '@nestjs/common';
import { BankInfoController } from './bank-info.controller';
import { BankInfoService } from './bank-info.service';

@Module({
  controllers: [BankInfoController],
  providers: [BankInfoService]
})
export class BankInfoModule {}
