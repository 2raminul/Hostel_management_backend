import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreatExpenseCategoriesDto {
  @ApiProperty({
    description: 'The name of the expense categories',
    example: 'Water Bill',
  })
  @IsNotEmpty()
  name: string;
}
