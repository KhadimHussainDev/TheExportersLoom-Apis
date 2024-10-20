import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // Assuming you have an auth module
import { ConfigModule,ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // Your entity paths
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'), // Be cautious about using `synchronize: true` in production
        logging:true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config service available globally
    }),
    UsersModule,  // Include your UsersModule
    AuthModule,   // Include any other necessary modules
  ],
})
export class AppModule {}
