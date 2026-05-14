import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { SummaryQueryDto } from '@/common/dto/summary-query.dto';

export class ExpenseSummaryQueryDto extends SummaryQueryDto {
  @ApiPropertyOptional({ description: 'Filter by expense category id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}
