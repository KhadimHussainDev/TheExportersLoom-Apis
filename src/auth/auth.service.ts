import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserProfile } from '../users/entities/user-profile.entity';
import { User } from '../users/entities/user.entity';

interface JwtUserPayload {
  email: string;
  userId: number;
  userType: string;
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
    private readonly dataSource: DataSource,
  ) {}

  // Generates JWT token for a user
  async generateJwt(
    user: JwtUserPayload,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload = {
      userId: user.userId,
      username: user.email,
      userType: user.userType,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  // Create user from Google OAuth
  async createGoogleUser(googleUser: any): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findUserByEmail(
        googleUser.email,
      );
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create User instance
      const newUser = this.userRepository.create({
        email: googleUser.email,
        username: `${googleUser.firstName} ${googleUser.lastName}`,
        userType: 'Google',
        googleAuth: true,
        picture: googleUser.picture,
      });

      // Save the User instance
      const savedUser = await queryRunner.manager.save(newUser);

      // Create UserProfile instance
      const userProfile = this.userProfileRepository.create({
        user: savedUser,
        name: `${googleUser.firstName} ${googleUser.lastName}`,
        googleAuth: true,
        profile_picture: googleUser.picture,
      });
      const savedProfile = await queryRunner.manager.save(userProfile);

      // Link UserProfile to User
      savedUser.profile = savedProfile;
      await queryRunner.manager.save(savedUser);

      // Create UserAuthentication entry with Google-specific defaults
      const userAuth = this.userAuthRepository.create({
        user: savedUser,
        passwordHash: '', // No password for Google-authenticated users
        TwoFactorEnabled: false,
        isEmailVerified: true,
      });
      await queryRunner.manager.save(userAuth);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Transaction failed: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
