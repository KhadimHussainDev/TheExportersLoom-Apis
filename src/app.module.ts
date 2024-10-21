import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';  // Ensure ConfigModule is imported
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';  // Import AppController
import { AppService } from './app.service';  // Import AppService

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Makes the configuration globally available
    }),
  
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Your PostgreSQL username
      password: 'August5,2002', // Your PostgreSQL password
      database: 'Exporters Loom',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Automatically synchronize your database with entities (use false in production)
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],  // Ensure AppController is listed
  providers: [AppService],  // Ensure AppService is listed
})
export class AppModule {}
