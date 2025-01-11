import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as ms from 'ms';
import { RequestUser } from './type/request-user';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  private accessTokenExpireIn = '24h';

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = {
      userId: user.id,
    };
    //console.log('user: ', user);

    return {
      access_token: this.getAccessToken(payload),
      refresh_token: this.getRefreshToken(payload),
      user: user,
      expires_at: this.getTokenExpireAt(),
    };
  }

  async refreshTokens(user: RequestUser): Promise<any> {
    const userInfo = await this.userService.findOne(user.userId);
    if (!userInfo) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    delete userInfo.password;
    const payload = {
      userId: user.userId,
    };

    const accessToken = this.getAccessToken(payload, this.accessTokenExpireIn);
    const refreshToken = this.getRefreshToken(payload);

    await this.authTokenService.saveTokens(accessToken, refreshToken, userInfo);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userInfo,
    };
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException('Invalid email or password !');
    }
    delete user.password;
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userService.findOne(id);
    delete user.password;
    return user;
  }

  async validateToken(token: string): Promise<any> {
    try {
      // need to work on this to validate signature and token
      const actualToken = token.replace('Bearer', '').trim();
      const decodedToken = await this.jwtService.decode(actualToken);
      return decodedToken;

      // const payload = await this.jwtService.verify(actualToken, {
      //   secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
      // });

      // if (payload) {
      //   throw new UnauthorizedException();
      // }

      // return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getAccessToken(payload: any, tokenExpireAt?: string) {
    const expiresIn = tokenExpireAt ? tokenExpireAt : '10h';

    return this.jwtService.sign(payload, {
      expiresIn: expiresIn,
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
  }

  getRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: this.configService.get<string>('JWT_TOKEN_SECRET'),
    });
  }

  getTokenExpireAt(): number {
    const expireAt = Date.now() + ms('3m');
    return expireAt;
  }
}
