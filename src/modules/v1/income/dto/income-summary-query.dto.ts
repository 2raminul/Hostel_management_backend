import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { SummaryQueryDto } from '@/common/dto/summary-query.dto';

export class IncomeSummaryQueryDto extends SummaryQueryDto {
  @ApiPropertyOptional({ description: 'Filter by payment method id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  paymentMethodId?: number;

  @ApiPropertyOptional({ description: 'Filter by booking platform id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookingPlatformId?: number;

  @ApiPropertyOptional({
    description:
      'Only entries with no booking platform (direct / walk-in). Ignored if bookingPlatformId is set.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  directBookingOnly?: boolean;
}
