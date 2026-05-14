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
import { BankInfoService } from './bank-info.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../../auth/guard/authenticated.user.guard';

@Controller('settings/bank-info')
@ApiTags('Settings - Bank Info')
@UseGuards(AuthenticatedUserGuard)
export class BankInfoController {
  constructor(private readonly bankInfoService: BankInfoService) {}

  @Post()
  create(@Body() dto: CreateBankDto) {
    return this.bankInfoService.create(dto);
  }

  @Get()
  findAll() {
    return this.bankInfoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankInfoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankDto) {
    return this.bankInfoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankInfoService.remove(+id);
  }
}
