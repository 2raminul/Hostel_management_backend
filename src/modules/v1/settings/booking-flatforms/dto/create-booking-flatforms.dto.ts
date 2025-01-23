import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';


export class CreateBookingFlatformsDto{
  @ApiProperty({
    description: 'The name of the booking platforms',
    example: 'Booking .com',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The booking flatforms is active or not',
    example: 'true',
  })
  @IsOptional()
  status: boolean;

}