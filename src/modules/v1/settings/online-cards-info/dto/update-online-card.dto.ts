import { PartialType } from '@nestjs/swagger';
import { CreateOnlineCardDto } from './create-online-cards.dto';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankDto extends PartialType(CreateOnlineCardDto) {
  @ApiProperty({
    description: 'The card id is mandatory',
    example: 'true',
  })
  @IsNotEmpty()
  id: number;
}
