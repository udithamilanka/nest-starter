import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE', 'postgres');

        if (!['mysql', 'postgres'].includes(dbType)) {
          throw new Error(
            `Invalid DB_TYPE: ${dbType}. Must be 'mysql' or 'postgres'`,
          );
        }

        return {
          type: dbType as 'mysql' | 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>(
            'DB_PORT',
            dbType === 'postgres' ? 5432 : 3306,
          ),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'nest_starter'),
          synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
          logging: configService.get<string>('DB_LOGGING') === 'true',
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
