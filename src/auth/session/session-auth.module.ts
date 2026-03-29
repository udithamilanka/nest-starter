import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../users/users.module';
import { SessionAuthService } from './session-auth.service';
import { SessionAuthController } from './session-auth.controller';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { SessionAuthGuard } from './session-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [SessionAuthController],
  providers: [
    SessionAuthService,
    LocalStrategy,
    SessionSerializer,
    SessionAuthGuard,
  ],
  exports: [SessionAuthService, SessionAuthGuard],
})
export class SessionAuthModule {}
