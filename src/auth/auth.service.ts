import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserProfile } from '../users/entities/user-profile.entity';
import { User } from '../users/entities/user.entity';

interface JwtUserPayload {
  email: string;
  user_id: number; 
  userType:string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,

    @InjectRepository(UserAuthentication)
    private readonly userAuthRepository: Repository<UserAuthentication>,

    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Generates JWT token for a user
  async generateJwt(user: JwtUserPayload): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload = { 
        sub: user.user_id, 
        username: user.email, 
        userType: user.userType 
    };
    console.log('Generating JWT with payload:', payload); // Add this line
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}



  // Create user from Google OAuth
  async createGoogleUser(googleUser: any): Promise<User> {
    const existingUser = await this.usersService.findUserByEmail(googleUser.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user if not found
    const newUser = this.userRepository.create({
      email: googleUser.email,
      username: `${googleUser.firstName} ${googleUser.lastName}`,
      userType: 'Google',
      googleAuth: true,
      picture: googleUser.picture,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create UserProfile entry
    const userProfile = this.userProfileRepository.create({
      user: savedUser,
      name: googleUser.firstName + ' ' + googleUser.lastName,
    });
    await this.userProfileRepository.save(userProfile);

    // Create UserAuthentication entry
    const userAuth = this.userAuthRepository.create({
      user: savedUser,
      passwordHash: '',
      TwoFactorEnabled: false,
      isEmailVerified: true,
    });
    await this.userAuthRepository.save(userAuth);

    return savedUser;
  }
}
