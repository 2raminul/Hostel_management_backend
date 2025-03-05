import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InventorySaleDto {
  @IsNumber()
  inventoryItemId: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;

  @IsNumber()
  saleUnitPrice: number;

  @IsNumber()
  sellCount: number;
}
