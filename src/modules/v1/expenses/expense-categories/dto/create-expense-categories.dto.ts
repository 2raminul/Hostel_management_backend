import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExpenseType } from '../entities/expense-categories.entity';


export class CreatExpenseCategoriesDto {
  @ApiProperty({
    description: 'The name of the expense categories',
    example: 'Water Bill',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of the expense',
    example: 'Fixed expenses, Variable expenses',
  })
  @IsEnum(ExpenseType)
  expenseType: ExpenseType;
}