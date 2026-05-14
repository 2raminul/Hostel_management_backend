import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'Cash' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Cash payment at reception', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
