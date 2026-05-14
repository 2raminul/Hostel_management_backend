import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({ example: 'Standard room on first floor' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  totalBeds: number;
}
