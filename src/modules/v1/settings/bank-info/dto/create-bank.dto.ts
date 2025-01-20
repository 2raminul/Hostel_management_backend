import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankDto {
  @ApiProperty({
    description: 'The Bank account number',
    example: 'Per Pices',
  })
  @IsOptional()
  accountNumber?: string;

  @ApiProperty({
    description: 'The Account is active or not',
    example: 'true',
  })
  @IsOptional()
  status: boolean;
}
