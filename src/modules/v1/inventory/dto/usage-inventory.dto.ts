import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InventoryUsageDto {
  @IsNumber()
  inventoryItemId: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;

  @IsNumber()
  usageCount: number;
}
