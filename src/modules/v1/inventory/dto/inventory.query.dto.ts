import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class InventoryQueryDto extends PaginationDto {
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  brand?: string;
}
