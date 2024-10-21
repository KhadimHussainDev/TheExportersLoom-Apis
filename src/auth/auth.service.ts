import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';  // Ensure UsersService is properly imported
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,  // Inject UsersService to handle DB queries
    private readonly jwtService: JwtService,  // Inject JwtService for token management
  ) {}

  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
  
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    // Fetch the user authentication record (which contains the password)
    const userAuth = await this.usersService.findAuthByUserId(user.user_id);  // You need to implement findAuthByUserId in UsersService
    
    if (userAuth && userAuth.passwordHash === password) {  // Compare passwords
      const { passwordHash, ...result } = userAuth;  // Exclude password hash
      return result;
    }
  
    throw new UnauthorizedException('Invalid credentials');
  }
  

  // Generate JWT token after successful login
  async login(user: any) {
    const payload = { username: user.username, sub: user.user_id }; // Payload for JWT
    return {
      access_token: this.jwtService.sign(payload),  // Generate the token
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
  
  
  // Validate Google login based on the email received
  async validateGoogleLogin(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);  // Find user by email

    if (!user) {
      throw new UnauthorizedException('User not registered');
    }

    return user;  // Return user if found
  }
  async registerGoogleUser(profile: any): Promise<User> {
    const email = profile.emails[0].value;
    const newUser = await this.usersService.createGoogleUser(email);
  
    // Optionally, you can add more data like name or profile picture from Google
    return newUser;
  }
  
}
