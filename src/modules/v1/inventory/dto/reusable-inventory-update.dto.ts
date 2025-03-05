import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ReusableItemStateEnum } from '../enums/reusable-item-state.enum';

export class ReusableInventoryUpdateDto {
  @IsNumber()
  inventoryItemId: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;

  @IsEnum(ReusableItemStateEnum)
  stateUpdateType: ReusableItemStateEnum;

  @IsNumber()
  count: number;
}
