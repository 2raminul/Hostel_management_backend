import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AccountType } from '../entities/bank.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankDto {
  @ApiProperty({
    description: 'The name of the Bank account',
    example: 'Milenium',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'The type of the account',
    example: 'Personal account, business account',
  })
  @IsEnum(AccountType)
  accountType: AccountType;

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