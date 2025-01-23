import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOnlineCardDto {
  @ApiProperty({
    description: 'The name of the card',
    example: 'Wise, revoult',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Bank id ',
    example: 1,
  })
  @IsOptional()
  bankId: number;

  @ApiProperty({
    description: 'card Number',
    example: 1,
  })
  @IsOptional()
  cardNumber: number;

  @ApiProperty({
    description: 'The Account is active or not',
    example: 'true',
  })
  @IsOptional()
  status: boolean;
}