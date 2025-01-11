import { PartialType } from '@nestjs/swagger';
import { CreatExpenseCategoriesDto } from './create-expense-categories.dto';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExpenseCategoriesDto extends PartialType(
  CreatExpenseCategoriesDto,
) {
  @ApiProperty({
    description: 'The expense id is mandatory',
    example: 'true',
  })
  @IsNotEmpty()
  id: number;
}
