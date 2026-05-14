import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateIncomeEntryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  bedId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  paymentMethodId: number;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  incomeDate: string;

  @ApiProperty({ example: 'Monthly rent for March', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ example: 1, required: false, description: 'Booking platform id if applicable' })
  @IsNumber()
  @IsOptional()
  bookingPlatformId?: number;

  @ApiProperty({ example: 1, required: false, description: 'Where this money is tracked (business/personal/cash, etc.)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  settlementAccountId?: number;
}
