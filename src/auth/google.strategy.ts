import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
      super({
        clientID: process.env.GOOGLE_CLIENT_ID,        
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
        callbackURL: process.env.GOOGLE_REDIRECT_URL,   
        scope: ['email', 'profile'],                    
      });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
      try {
        const { emails } = profile;
        let user = await this.authService.validateGoogleLogin(emails[0].value);
        
        // If user does not exist, create a new user
        if (!user) {
          user = await this.authService.registerGoogleUser(profile);
        }
    
        done(null, user);
      } catch (error) {
        console.error('Error during Google authentication:', error);
        done(error, false);
      }
    }
    
    
  
}
