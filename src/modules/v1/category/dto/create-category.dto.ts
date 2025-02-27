import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  reusable: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isInventoryItem: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isSaleItem: boolean;

  @IsNotEmpty()
  @IsString()
  unit: string;
}
