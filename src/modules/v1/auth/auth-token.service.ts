import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthToken } from './entities/auth-token.entity';
import { toZonedTime } from 'date-fns-tz';
import { addDays } from 'date-fns';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthTokenService {
  constructor(
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>,

    private configService: ConfigService,
  ) {}

  private timeZone = 'Asia/Dhaka';

  async saveTokens(accessToken: string, refreshToken: string, user: User) {
    try {
      // Get the current time in the specified time zone
      const zonedCurrentTime = toZonedTime(new Date(), this.timeZone);
      // Add 30days to the current time
      const refreshTokenexpireTime = addDays(zonedCurrentTime, 30);

      const payload = {
        accessToken,
        refreshToken,
        refreshTokenExpireAt: refreshTokenexpireTime,
        user: user,
      };

      const authTokenRepository = this.authTokenRepository.create(payload);
      return await this.authTokenRepository.save(authTokenRepository);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
