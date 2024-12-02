import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    console.log('JWT_SECRET in JwtStrategy:', jwtSecret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    // console.log('JWT Secret:', configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any) {
    console.log('Payload received in validate:', payload); // Add this line for debugging
    const user = {
      user_id: payload.user_id,
      username: payload.username,
      userType: payload.userType,
    };
    return {
      user_id: payload.user_id || payload.sub,
      username: payload.username,
      userType: payload.userType,
    };
  }
}
