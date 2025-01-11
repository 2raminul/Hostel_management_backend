import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the Category',
    example: 'Soup',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The Category is active or not',
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
