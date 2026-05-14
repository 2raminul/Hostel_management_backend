import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const u = req.currentUser as { isAdmin?: boolean } | undefined;
    if (u?.isAdmin) return true;
    throw new ForbiddenException('Admin only.');
  }
}
