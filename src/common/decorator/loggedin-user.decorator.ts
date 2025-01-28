import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../../modules/v1/auth/type/request-user';

export const CurrentUser = createParamDecorator(
  (data: never, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser ?? null;
  },
);
