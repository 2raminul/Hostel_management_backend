import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
  constructor() {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'];
    if (!authHeader) {
      return false;
    }
    const authHeaderArr = authHeader.split(' ');
    if (authHeaderArr.length !== 2) {
      return false;
    }
    const token = authHeaderArr[1];
    try {
      const user = jwtDecode(token);
      if (!user) {
        return false;
      }
      if (user.exp > new Date().getTime()) {
        /**
         * Do check roles here once that is implemented
         */

        request.currentUser = user;
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return false;
  }
}
