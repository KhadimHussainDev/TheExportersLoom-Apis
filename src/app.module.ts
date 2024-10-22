import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';  // Assuming you have an auth module
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';  // Import AppController
import { AppService } from './app.service';  // Import AppService

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Makes the config service available globally
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',  // Use config service for dynamic configuration
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],  // Your entity paths
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),  // Use synchronize from config
        logging: true,
      }),
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],  // Include AppController
  providers: [AppService],  // Include AppService
})
export class AppModule {}
