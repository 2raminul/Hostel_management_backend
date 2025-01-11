import { Module } from '@nestjs/common';
import { BookingFlatformsController } from './booking-flatforms.controller';
import { BookingFlatformsService } from './booking-flatforms.service';

@Module({
  controllers: [BookingFlatformsController],
  providers: [BookingFlatformsService]
})
export class BookingFlatformsModule {}
