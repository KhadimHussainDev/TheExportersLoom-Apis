import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';  // Assuming you're using JWT for token management
import { UsersModule } from '../users/users.module';  // Module that handles User entity
import { ConfigModule, ConfigService } from '@nestjs/config';  // Handles .env configurations
import { AuthGoogleController } from './auth-google.controller';  // Your Google OAuth controller

@Module({
  imports: [
    UsersModule,  // Import UsersModule for managing user information
    PassportModule.register({ defaultStrategy: 'jwt' }),  // Default to JWT for strategies
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),  // Use .env for JWT secret
        signOptions: { expiresIn: '60m' },  // Token expiration (customizable)
      }),
    }),
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy],  // Register services and strategies
  controllers: [AuthController, AuthGoogleController],  // Register controllers
  exports: [AuthService],  // Export AuthService for use in other modules
})
export class AuthModule {}
