import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super({
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ||
        process.env.GOOGLE_CLIENT_ID,
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ||
        process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, name, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };

    try {
      let existingUser = await this.usersService.findUserByEmail(user.email);
      if (!existingUser) {
        existingUser = await this.authService.createGoogleUser(user);
      }

      // Issue a JWT token for the user (whether signing up or signing in)
      const jwt = await this.authService.generateJwt({
        email: existingUser.email,
        userId: existingUser.user_id,
        userType: existingUser.userType,
      });

      done(null, { user: existingUser, jwt });
    } catch (error) {
      done(error, false);
    }
  }
}
