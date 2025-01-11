import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookingFlatformsDto } from './create-booking-flatforms.dto';
import { IsNotEmpty } from 'class-validator';


export class UpdateBookingPlatformsDto extends PartialType(
  CreateBookingFlatformsDto,
) {
  @ApiProperty({
    description: 'The Booking id is mandatory',
    example: 'true',
  })
  @IsNotEmpty()
  id: number;
}