import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  categoryId: number;

  @IsString()
  brand: string;

  @IsString()
  @MaxLength(500, {
    message: 'Remarks text length should not exceed 500 characters',
  })
  @IsOptional()
  remarks?: string | undefined;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsDate({ message: 'expenseDate is required' })
  expenseDate: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  settlementAccountId?: number;
}
