import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'The name of the item',
    example: 'Bed Cover',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The price of the item',
    example: 45,
  })
  @IsNotEmpty()
  price: number;


  @ApiProperty({
    description: 'The quantity of the item',
    example: 45,
  })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'The Item is used or not',
    example: '20',
  })
  @IsOptional()  
  itemsUsed: number;

  @ApiProperty({
    description: 'The Item is a laundry item or not',
    example: 'Yes',
  })
  @IsOptional()  
  laundryItem: string;

  @ApiProperty({
    description: 'The item is active or not',
    example: 'true',
  })
  @IsOptional()  
  status: boolean;

  @ApiProperty({
    description: 'Category of the item',
    example: 1,
  })
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({
    description: 'unit of the item',
    example: 1,
  })
  @IsNotEmpty()
  unitId: number;
}
