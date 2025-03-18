import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthentication } from './entities/auth.entity';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET || configService.get<string>('JWT_SECRET') || '123',
        signOptions: {
          expiresIn: '315360000s',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserAuthentication]),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy, AuthService],
  exports: [JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule { }
