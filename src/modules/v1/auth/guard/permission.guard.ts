// dynamic-permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // keep this for testing will delete when all permission will be set
    if (!requiredPermissions) {
      return true; // If no permissions are required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userWithPermissions = await this.userService.findOne(user.id, [
      'role',
      'role.permissions',
    ]);

    if (!userWithPermissions || !userWithPermissions.role) {
      // check for role setting and permission setting here to better logging
      return false;
    }

    // Check if the user has the required permissions
    const userPermissions = userWithPermissions.role.permissions.map(
      (perm) => perm.name,
    );

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
