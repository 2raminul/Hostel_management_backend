import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OnlineCardsInfoService } from './online-cards-info.service';
import { CreateOnlineCardDto } from './dto/create-online-cards.dto';
import { UpdateBankDto } from './dto/update-online-card.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../../auth/guard/authenticated.user.guard';

@Controller('settings/online-cards')
@ApiTags('Settings - Online Cards')
@UseGuards(AuthenticatedUserGuard)
export class OnlineCardsInfoController {
  constructor(private readonly onlineCardsInfoService: OnlineCardsInfoService) {}

  @Post()
  create(@Body() dto: CreateOnlineCardDto) {
    return this.onlineCardsInfoService.create(dto);
  }

  @Get()
  findAll() {
    return this.onlineCardsInfoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onlineCardsInfoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankDto) {
    return this.onlineCardsInfoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onlineCardsInfoService.remove(+id);
  }
}
