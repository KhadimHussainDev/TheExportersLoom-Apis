import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';  // Ensure UsersService is properly imported
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,  
    private readonly jwtService: JwtService,  
  ) {}

  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Fetch the user authentication record (which contains the password)
    const userAuth = await this.usersService.findAuthByUserId(user.user_id);  
    
    if (userAuth && userAuth.passwordHash === password) {  
      const { passwordHash, ...result } = userAuth; 
      return result;
    }
  
    throw new UnauthorizedException('Invalid credentials');
  }
  

  // Generate JWT token after successful login
  async login(user: any) {
    const payload = { username: user.username, sub: user.user_id }; 
    return {
      access_token: this.jwtService.sign(payload),  
    };
  }

  // Google OAuth login handler
  async googleLogin(req: any): Promise<any> {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }
    const user = await this.usersService.findByEmail(req.user.email);
    if (!user) {
      throw new UnauthorizedException('User not registered');
    }
    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
  
  

  async validateGoogleLogin(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);  

    if (!user) {
      throw new UnauthorizedException('User not registered');
    }

    return user;  // Return user if found
  }
  async registerGoogleUser(profile: any): Promise<User> {
    const email = profile.emails[0].value;
    const newUser = await this.usersService.createGoogleUser(email);
    return newUser;
  }
  
}
