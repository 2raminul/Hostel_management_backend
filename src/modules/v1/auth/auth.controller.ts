import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login.response';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { RequestUser } from './type/request-user';

import { ResponseType } from '@/common/decorator/response-type.decorator';
import { Permissions } from '@/common/decorator/permission.decorator';
import { CurrentUser } from '../../../common/decorator/loggedin-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    description: 'Login response',
    status: 200,
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password !' })
  @Post('/login')
  @ResponseType(LoginResponseDto)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshAuthGuard)
  refresh(@CurrentUser() user: RequestUser) {
    return this.authService.refreshTokens(user);
  }

  @ApiBearerAuth()
  @Permissions('MANAGE_ALL_DATA')
  @Get('/test-auth-route')
  findAll(@Req() req: Request) {
    return req.user;
  }
}
