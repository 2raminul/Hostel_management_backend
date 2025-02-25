import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryQueryDto } from './dto/inventory.query.dto';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';

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

  @Get('items-list')
  getInvenoryList(@Query() inventoryQueryDto: InventoryQueryDto) {
    return this.inventoryService.getInvenoryList(inventoryQueryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(+id, updateInventoryDto);
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
