import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),  
    });
    console.log('JWT Secret:', configService.get<string>('JWT_SECRET'));
  }

  async validate(payload: any) {
    console.log('Payload received in validate:', payload); // Add this line for debugging
    const user = { 
        user_id: payload.sub, 
        username: payload.username, 
        userType: payload.userType 
    };
    if (!user.user_id || !user.userType) { 
        console.error('Missing user_id or userType in JWT payload'); // Debugging check
        throw new UnauthorizedException('Invalid token payload');
    }
    return user;
}

  
}
