import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthUser, AuthResult } from '../common/interfaces';

@Injectable()
export class JwtAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isValid = await this.usersService.verifyPassword(
      password,
      user.password,
    );
    if (!isValid) return null;

    if (!user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      clientId: user.clientId,
    };
  }

  async login(user: AuthUser): Promise<AuthResult> {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    } as JwtSignOptions);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900,
      message: 'Login successful',
    };
  }

  async refreshToken(token: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login({
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        clientId: user.clientId,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
