import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AdminGuard } from './admin.guard';
import { ModulePermissionGuard } from './module-permission.guard';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, AdminGuard, ModulePermissionGuard],
  exports: [PermissionsService, AdminGuard, ModulePermissionGuard],
})
export class PermissionsModule {}
