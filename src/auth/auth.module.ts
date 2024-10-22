import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleSignInStrategy } from './google.strategy';
import { GoogleSignUpStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGoogleController } from './auth-google.controller';

@Module({
  imports: [
    forwardRef(() => UsersModule),  // Allows circular dependencies for UsersModule
    PassportModule.register({ defaultStrategy: 'jwt' }),  // Keeps JWT as default
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3600s') },  // Dynamic expiration from env
      }),
    }),
  ],
  providers: [AuthService, GoogleSignInStrategy, GoogleSignUpStrategy, JwtStrategy],  // Include both Google and JWT strategies
  controllers: [AuthController, AuthGoogleController],  // Include both controllers
  exports: [AuthService, JwtModule],  // Export AuthService and JwtModule
})
export class AuthModule {}
