import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthCommonModule } from './common';
import { JwtAuthModule, JwtAuthGuard } from './jwt';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        {
          provide: APP_GUARD,
          useFactory: () => {
            return new JwtAuthGuard(new Reflector());
          },
        },
      ],
    };
  }

  static register(): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCommonModule, JwtAuthModule],
      exports: [AuthCommonModule, JwtAuthModule],
    };
  }
}
