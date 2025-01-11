import { Module } from '@nestjs/common';
import { OnlineCardsInfoController } from './online-cards-info.controller';
import { OnlineCardsInfoService } from './online-cards-info.service';

@Module({
  controllers: [OnlineCardsInfoController],
  providers: [OnlineCardsInfoService]
})
export class OnlineCardsInfoModule {}
