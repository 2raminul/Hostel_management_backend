import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleAccess } from './permissions.constants';

export type PermMeta = { module: string; level: keyof ModuleAccess };

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.get<PermMeta | undefined>(
      'modulePermission',
      context.getHandler(),
    );
    if (!meta) return true;
    const req = context.switchToHttp().getRequest();
    const u = req.currentUser as {
      isAdmin?: boolean;
      permissions?: Record<string, ModuleAccess>;
    };
    if (!u) throw new ForbiddenException();
    if (u.isAdmin) return true;
    const mod = u.permissions?.[meta.module];
    if (!mod?.[meta.level]) throw new ForbiddenException();
    return true;
  }
}
