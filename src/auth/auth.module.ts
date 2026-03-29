import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthCommonModule } from './common';
import { JwtAuthModule, JwtAuthGuard } from './jwt';
import { SessionAuthModule, SessionAuthGuard } from './session';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: APP_GUARD,
          useFactory: (configService: ConfigService) => {
            const authType = configService.get<string>('AUTH_TYPE', 'jwt');
            if (authType === 'session') {
              return new SessionAuthGuard(
                new (require('@nestjs/core').Reflector)(),
              );
            }
            return new JwtAuthGuard(
              new (require('@nestjs/core').Reflector)(),
            );
          },
          inject: [ConfigService],
        },
      ],
    };
  }

  static register(): DynamicModule {
    const authType = process.env.AUTH_TYPE || 'jwt';

    const imports = [AuthCommonModule];
    if (authType === 'jwt') {
      imports.push(JwtAuthModule);
    } else if (authType === 'session') {
      imports.push(SessionAuthModule);
    }

    return {
      module: AuthModule,
      imports,
      exports: imports,
    };
  }
}
