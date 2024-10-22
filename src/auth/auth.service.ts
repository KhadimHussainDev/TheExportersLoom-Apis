import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';  // Ensure UsersService is properly imported
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';  // Import bcrypt for password comparison

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithAuth(email); // Get user along with authentication info

    if (!user || !user.userAuth || user.userAuth.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userAuth = user.userAuth[0];  // Assuming there is only one userAuth record

    // Compare the hashed password from the database with the plain text password
    const isPasswordValid = await bcrypt.compare(password, userAuth.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return the user object without the passwordHash
    const { passwordHash, ...result } = userAuth;
    return result;
  }

  // Generates JWT token for a user
  async generateJwt(user: any): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload = { username: user.email, sub: user.id }; // Adjust payload structure to fit your user entity

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
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

  // Validate Google login
  async validateGoogleLogin(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User not registered');
    }

    return user;  // Return user if found
  }

  // Register Google user
  async registerGoogleUser(profile: any): Promise<User> {
    const email = profile.emails[0].value;
    const newUser = await this.usersService.createGoogleUser(email);
    return newUser;
  }
}
