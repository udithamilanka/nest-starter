import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../../users/users.module';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthController } from './jwt-auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          secret: configService.get<string>('JWT_SECRET', 'default-secret'),
          signOptions: {
            expiresIn: configService.get('JWT_ACCESS_EXPIRATION', '15m'),
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [JwtAuthController],
  providers: [JwtAuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthService, JwtAuthGuard],
})
export class JwtAuthModule {}
