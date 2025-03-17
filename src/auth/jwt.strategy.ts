import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const secret = process.env.JWT_SECRET || configService.get<string>('JWT_SECRET') || '123';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // make true to not check expiration
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    try {
      // Support both userId and user_id in the payload
      const userId = payload.userId || payload.user_id;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Use the UsersService to find the user
      const user = await this.usersService.findOne(userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
