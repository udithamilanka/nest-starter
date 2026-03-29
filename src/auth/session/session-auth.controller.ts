import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { SessionAuthService } from './session-auth.service';
import { LoginDto } from '../common/dto';
import { Public, CurrentUser } from '../common/decorators';
import type { AuthUser } from '../common/interfaces';

@Controller('auth')
export class SessionAuthController {
  constructor(private sessionAuthService: SessionAuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() _loginDto: LoginDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.sessionAuthService.login(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.sessionAuthService.logout(req);
    res.clearCookie('connect.sid');
    return { message: 'Logged out successfully' };
  }
}
