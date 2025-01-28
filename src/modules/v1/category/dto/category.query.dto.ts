import { PaginationDto } from '@/common/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class CategoryQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  reusable?: string;

  @IsOptional()
  @IsString()
  isInventoryItem?: string;

  @IsOptional()
  @IsString()
  unit?: string;
}
