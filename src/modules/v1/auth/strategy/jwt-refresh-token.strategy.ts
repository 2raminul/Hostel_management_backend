import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthTokenService } from '../auth-token.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  constructor(private authTokenService: AuthTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  //need to work on this

  async validate(req: Request, payload: any) {
    try {
      const refreshToken = req
        .get('Authorization')
        .replace('Bearer', '')
        .trim();

      // need to check in database for refresh token to verify user identity
      return { ...payload, refreshToken };
    } catch (error) {
      this.logger.log('error', error.message);

      return false;
    }
  }
}
