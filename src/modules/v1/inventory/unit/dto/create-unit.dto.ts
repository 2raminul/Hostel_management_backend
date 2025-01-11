import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: 'The name of the Item unit',
    example: 'Per Pices',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Item unit short name',
    example: 'pcs',
  })
  @IsNotEmpty()
  shortName: string;

  @ApiProperty({
    description: 'The item unit is active or not',
    example: 'true',
  })
  @IsOptional()  
  status: boolean;

  //   @ApiProperty({
  //     description: 'Category image url',
  //     example: 'http://localhost:3000/api/images/945jduf945movd.jpg',
  //   })
  //   @IsOptional()
  //   imageUrl: string;
}
