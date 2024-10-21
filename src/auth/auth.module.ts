import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';  
import { UsersModule } from '../users/users.module';  
import { ConfigModule, ConfigService } from '@nestjs/config';  
import { AuthGoogleController } from './auth-google.controller';  

@Module({
  imports: [
    UsersModule,  
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),  
        signOptions: { expiresIn: '60m' }, 
      }),
    }),
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy],  
  controllers: [AuthController, AuthGoogleController],  
  exports: [AuthService], 
})
export class AuthModule {}
