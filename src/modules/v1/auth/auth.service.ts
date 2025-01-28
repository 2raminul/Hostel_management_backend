import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectConnection, Knex } from 'nestjs-knex';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RequestUser } from './type/request-user';
@Injectable()
export class AuthService {
  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    /**
     * We need to add role and role related accesses in the payload once the roles guard is ready
     */
    const payload = {
      iat: new Date().getTime(),
      userId: (user as any).id,
      name: user.name,
      email: user.email,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: {
        name: user.name,
        email: user.email,
      },
    };
  }

  async validatePassword(plainTextPass: string, hashedPass: string) {
    return await bcrypt.compare(plainTextPass, hashedPass);
  }

  async refreshTokens(user: RequestUser) {
    const payload = {
      iat: new Date().getTime(),
      userId: (user as any).id,
      name: user.name,
      email: user.email,
    };
    console.log('user:', payload);
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      user: {
        name: user.name,
        email: user.email,
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
