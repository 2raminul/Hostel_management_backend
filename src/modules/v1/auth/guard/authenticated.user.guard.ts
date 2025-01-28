import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthenticatedUserGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('trying to get authHeader');
    const authHeader: string = request.headers['authorization'];
    console.log('found:', authHeader);
    if (!authHeader) {
      console.log('no auth header!');
      return false;
    }
    const authHeaderArr = authHeader.split(' ');
    if (authHeaderArr.length !== 2) {
      console.log('auth header length is not 2!');
      return false;
    }
    const token = authHeaderArr[1];
    console.log('token:', token);
    try {
      const user = jwtDecode(token);
      console.log('user: ', user);
      if (!user) {
        console.log('no user in decoded one');
        return false;
      }
      const expireTime =
        user.iat +
        this.configService.get<number>('ACCESS_TOKEN_EXPIRE_TIME') * 1000;
      if (expireTime > new Date().getTime()) {
        console.log('remaining time:', expireTime - new Date().getTime());
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
    console.log('returning false ...');
    return false;
  }
}
