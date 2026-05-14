import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUserGuard } from '../auth/guard/authenticated.user.guard';
import { AdminGuard } from './admin.guard';
import { PermissionsService } from './permissions.service';
import { APP_MODULES } from './permissions.constants';
import { CurrentUser } from '@/common/decorator/loggedin-user.decorator';
import { RequestUser } from '../auth/type/request-user';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@ApiTags('Permissions')
@UseGuards(AuthenticatedUserGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('modules')
  listModules() {
    return { modules: APP_MODULES };
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    const [permissions, isAdmin] = await Promise.all([
      this.permissionsService.getEffectivePermissions(user.userId),
      this.permissionsService.isUserAdmin(user.userId),
    ]);
    return { userId: user.userId, isAdmin, permissions };
  }

  @Get('user/:userId')
  @UseGuards(AdminGuard)
  async getForUser(@Param('userId') userId: string) {
    const id = +userId;
    const permissions =
      await this.permissionsService.getEffectivePermissions(id);
    const rows = await this.permissionsService.listUserPermissions(id);
    return { userId: id, permissions, rows };
  }

  @Put('user/:userId')
  @UseGuards(AdminGuard)
  async updateForUser(
    @Param('userId') userId: string,
    @Body() body: UpdatePermissionsDto,
  ) {
    const id = +userId;
    return this.permissionsService.replaceUserPermissions(id, body.modules ?? {});
  }
}
