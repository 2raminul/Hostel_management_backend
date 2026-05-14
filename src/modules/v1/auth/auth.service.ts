import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestUser } from './type/request-user';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly permissionsService: PermissionsService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.hmDb('users')
      .where({
        email: loginDto.email,
        is_active: true,
        deleted_at: null,
      })
      .select('id', 'name', 'email', 'password')
      .first();
    if (!user) {
      throw new UnauthorizedException();
    }
    const isPasswordValid = await this.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const uid = (user as { id: number }).id;
    const [isAdmin, permissions] = await Promise.all([
      this.permissionsService.isUserAdmin(uid),
      this.permissionsService.getEffectivePermissions(uid),
    ]);
    const payload = {
      iat: new Date().getTime(),
      userId: uid,
      name: user.name,
      email: user.email,
      isAdmin,
      permissions,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: {
        name: user.name,
        email: user.email,
        isAdmin,
        permissions,
      },
    };
  }

  async validatePassword(plainTextPass: string, hashedPass: string) {
    return await bcrypt.compare(plainTextPass, hashedPass);
  }

  async refreshTokens(user: RequestUser) {
    const uid = user.userId;
    const [isAdmin, permissions] = await Promise.all([
      this.permissionsService.isUserAdmin(uid),
      this.permissionsService.getEffectivePermissions(uid),
    ]);
    const payload = {
      iat: new Date().getTime(),
      userId: uid,
      name: user.name,
      email: user.email,
      isAdmin,
      permissions,
    };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: {
        name: user.name,
        email: user.email,
        isAdmin,
        permissions,
      },
    };
  }

  async findById(id: number) {}

  generateAccessToken(payload: any) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload);
    // Intentionally skipping await.
    this.cacheManager.set(
      payload.userId,
      refreshToken,
      this.configService.get<number>('REFRESH_TOKEN_EXPIRE_TIME') * 1000,
    );
    return refreshToken;
  }
}
