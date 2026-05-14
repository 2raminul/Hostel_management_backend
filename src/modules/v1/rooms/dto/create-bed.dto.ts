import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBedDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  roomId: number;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  bedLabel: string;

  @ApiProperty({ example: 'Near window' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
