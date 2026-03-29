import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { AuthUser, AuthResult } from '../common/interfaces';
import { Request } from 'express';

@Injectable()
export class SessionAuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isValid = await this.usersService.verifyPassword(password, user.password);
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
    return {
      user,
      message: 'Login successful',
    };
  }

  async logout(request: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      request.logout((err) => {
        if (err) {
          reject(err);
          return;
        }
        if (request.session) {
          request.session.destroy((sessionErr) => {
            if (sessionErr) {
              reject(sessionErr);
              return;
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
}
