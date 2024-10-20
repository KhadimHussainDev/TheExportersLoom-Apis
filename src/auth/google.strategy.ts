// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../users/users.service'; // Use your existing UsersService
// import { AuthService } from './auth.service'; // Use the existing AuthService to generate JWT

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(
//     private configService: ConfigService,
//     private usersService: UsersService,
//     private authService: AuthService, // To generate JWT
//   ) {
//     super({
//       clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
//       clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
//       callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
//       scope: ['email', 'profile'],
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
//     const { emails, name, photos } = profile;

//     const user = {
//       email: emails[0].value,
//       firstName: name.givenName,
//       lastName: name.familyName,
//       picture: photos[0].value,
//     };

//     // Check if the user exists in the system by email
//     let existingUser = await this.usersService.findUserByEmail(user.email);

//     if (!existingUser) {
//       // If user doesn't exist, create a new one
//       existingUser = await this.usersService.createUserFromGoogle(user);
//     }

//     // Issue a JWT token for the user, whether they are new or existing
//     const jwt = await this.authService.generateJwt(existingUser);

//     done(null, { user: existingUser, jwt });
//   }
// }
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
    private authService: AuthService,  // To generate JWT
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
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

    // Check if the user exists in the system by email
    let existingUser = await this.usersService.findUserByEmail(user.email);

    if (!existingUser) {
        // If user doesn't exist, create a new one
        existingUser = await this.usersService.createUserFromGoogle(user);
    }

    // Issue a JWT token for the user, whether they are new or existing
    const jwt = await this.authService.generateJwt(existingUser);

    done(null, { user: existingUser, jwt });
}

}
