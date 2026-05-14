import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { SettlementAccountsService } from './settlement-accounts.service';

@ApiTags('Settings - Settlement accounts')
@UseGuards(AuthenticatedUserGuard)
@Controller('settings/settlement-accounts')
export class SettlementAccountsController {
  constructor(private readonly service: SettlementAccountsService) {}

  @Get()
  list() {
    return this.service.findAllActive();
  }
}
