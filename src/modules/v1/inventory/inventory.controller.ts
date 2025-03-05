import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryQueryDto } from './dto/inventory.query.dto';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { InventoryUsageDto } from './dto/usage-inventory.dto';
import { InventorySaleDto } from './dto/sale-inventory.dto';
import { ReusableInventoryUpdateDto } from './dto/reusable-inventory-update.dto';

@UseGuards(AuthenticatedUserGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  addToInventory(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inventoryService.addToInventory(createInventoryDto, user);
  }

  @Post('decrease-due-to-usage')
  decreaseDueToUsage(
    @CurrentUser() user: RequestUser,
    @Body() inventoryUsageDto: InventoryUsageDto,
  ) {
    return this.inventoryService.decreaseDueToUsage(inventoryUsageDto, user);
  }

  @Post('decrease-due-to-sale')
  decreaseDueToSale(
    @CurrentUser() user: RequestUser,
    @Body() inventorySaleDto: InventorySaleDto,
  ) {
    return this.inventoryService.decreaseDueToSale(inventorySaleDto, user);
  }

  @Post('update-reusable-count')
  updateReusableCount(
    @CurrentUser() user: RequestUser,
    @Body() reusableInventoryUpdateDto: ReusableInventoryUpdateDto,
  ) {
    return this.inventoryService.updateReusableCount(
      reusableInventoryUpdateDto,
      user,
    );
  }

  @Get('items-list')
  getInvenoryList(@Query() inventoryQueryDto: InventoryQueryDto) {
    return this.inventoryService.getInvenoryList(inventoryQueryDto);
  }

  @Get('detail/:id')
  getInvenoryItemDetail(@Param('id') id: string) {
    return this.inventoryService.getInventoryItemDetail(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }

  @Get('brands')
  getBrands() {
    console.log('is this here?!');
    return this.inventoryService.findBrands();
  }
}
