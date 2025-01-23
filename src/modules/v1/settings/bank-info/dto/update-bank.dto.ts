import { PartialType } from '@nestjs/swagger';
import { CreateBankDto } from './create-bank.dto';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankDto extends PartialType(CreateBankDto) {
  @ApiProperty({
    description: 'The Bank id is mandatory',
    example: 'true',
  })
  @IsNotEmpty()
  id: number;
}
