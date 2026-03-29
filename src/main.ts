import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const authType = configService.get<string>('AUTH_TYPE', 'jwt');

  if (authType === 'session') {
    app.use(
      session({
        secret: configService.get<string>('SESSION_SECRET', 'session-secret'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: configService.get<number>('SESSION_MAX_AGE', 86400000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
  }

  await app.listen(configService.get<number>('PORT', 8000));
}
void bootstrap();
