import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from './create-unit.dto';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {
  @ApiProperty({
    description: 'The item unit id is mandatory',
    example: 'true',
  })
  @IsNotEmpty()
  id: number;
}
