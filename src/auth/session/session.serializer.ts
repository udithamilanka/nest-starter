import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';
import { AuthUser } from '../common/interfaces';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: AuthUser, done: (err: Error | null, id?: string) => void) {
    done(null, user.id);
  }

  async deserializeUser(
    userId: string,
    done: (err: Error | null, user?: AuthUser | null) => void,
  ) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        return done(null, null);
      }
      done(null, {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        clientId: user.clientId,
      });
    } catch (err) {
      done(err as Error, null);
    }
  }
}
