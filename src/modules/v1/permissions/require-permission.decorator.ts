import { SetMetadata } from '@nestjs/common';
import { ModuleAccess } from './permissions.constants';

export const RequirePermission = (
  module: string,
  level: keyof ModuleAccess,
) => SetMetadata('modulePermission', { module, level });
