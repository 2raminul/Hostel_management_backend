import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { jwtDecode } from 'jwt-decode';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      const { refreshToken } = req.body;
      const decodedToken = jwtDecode(refreshToken);
      console.log('Decoded Ref:', decodedToken);
      const savedToken = await this.cacheManager.get(
        (decodedToken as any).userId,
      );
      if (!savedToken || savedToken !== refreshToken) {
        return false;
      }
      req.user = decodedToken;
      return { ...payload, refreshToken };
    } catch (error) {
      this.logger.log('error', error.message);
      return false;
    }
  }
}
