import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreateIncomeEntryDto } from './dto/create-income-entry.dto';
import { UpdateIncomeEntryDto } from './dto/update-income-entry.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { IncomeSummaryQueryDto } from './dto/income-summary-query.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { CurrentUser } from '../../../common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';

@ApiTags('Income')
@UseGuards(AuthenticatedUserGuard)
@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  // ─── Payment Methods ──────────────────────────────────────────────────

  @Post('payment-methods')
  createPaymentMethod(@Body() dto: CreatePaymentMethodDto) {
    return this.incomeService.createPaymentMethod(dto);
  }

  @Get('payment-methods')
  findAllPaymentMethods() {
    return this.incomeService.findAllPaymentMethods();
  }

  // ─── Income Entries ───────────────────────────────────────────────────

  @Get('summary')
  getIncomeSummary(@Query() q: IncomeSummaryQueryDto) {
    return this.incomeService.getSummary(q.dateFrom, q.dateTo, {
      paymentMethodId: q.paymentMethodId,
      bookingPlatformId: q.bookingPlatformId,
      directBookingOnly: q.directBookingOnly,
    });
  }

  @Post('entries')
  createIncomeEntry(
    @Body() dto: CreateIncomeEntryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.incomeService.createIncomeEntry(dto, user);
  }

  @Get('entries')
  getIncomeList(@Query() queryDto: IncomeQueryDto) {
    return this.incomeService.getIncomeList(queryDto);
  }

  @Get('entries/:id')
  findOneIncomeEntry(@Param('id') id: string) {
    return this.incomeService.findOneIncomeEntry(+id);
  }

  @Patch('entries/:id')
  updateIncomeEntry(
    @Param('id') id: string,
    @Body() dto: UpdateIncomeEntryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.incomeService.updateIncomeEntry(+id, dto, user);
  }

  @Delete('entries/:id')
  removeIncomeEntry(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.incomeService.removeIncomeEntry(+id, user);
  }

  // ─── Daily Summary ────────────────────────────────────────────────────

  @Get('daily-summary')
  getDailySummary(
    @Query('date') date?: string,
    @Query('roomId') roomId?: string,
  ) {
    return this.incomeService.getDailySummary(date, roomId ? +roomId : undefined);
  }
}
