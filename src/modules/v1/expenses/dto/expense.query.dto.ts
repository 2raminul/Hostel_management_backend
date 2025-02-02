import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class ExpenseQueryDto extends PaginationDto {
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsDate()
  purchaseDateAfter: Date;

  @IsOptional()
  @IsDate()
  purchaseDateBefore: Date;
}
