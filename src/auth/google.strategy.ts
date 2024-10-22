import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GoogleSignInStrategy extends PassportStrategy(Strategy, 'google-signin') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,  // To find or create a user
    private authService: AuthService,    // To generate JWT
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',  // Callback URL for Sign-In
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails, name, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };
  
    try {
      // Check if the user already exists
      let existingUser = await this.usersService.findUserByEmail(user.email);
  
      if (!existingUser) {
        // Throw an error if the user doesn't exist instead of creating a new one
        return done(new UnauthorizedException('User not found. Please sign up first.'), false);
      }
  
      // Issue a JWT token for the user
      const jwt = await this.authService.generateJwt(existingUser);
      done(null, { user: existingUser, jwt });
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      done(error, false);
    }
  }
  
}

@Injectable()
export class GoogleSignUpStrategy extends PassportStrategy(Strategy, 'google-signup') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,  // To find or create a user
    private authService: AuthService,    // To generate JWT
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/signupcallback',  // Callback URL for Sign-Up
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { emails, name, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
    };

    try {
      // Check if the user already exists
      let existingUser = await this.usersService.findUserByEmail(user.email);

      if (!existingUser) {
        // If the user doesn't exist, create a new one (sign-up specific logic)
        existingUser = await this.usersService.createUserFromGoogle(user);
      }

      // Issue a JWT token for the user
      const jwt = await this.authService.generateJwt(existingUser);
      done(null, { user: existingUser, jwt });
    } catch (error) {
      console.error('Error during Google sign-up:', error);
      done(error, false);
    }
  }
}
