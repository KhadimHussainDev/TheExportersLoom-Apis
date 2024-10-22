import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity'; 
import { UserAuthentication } from '../auth/entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { nanoid } from 'nanoid';
import { randomBytes } from 'crypto';
import { ResetToken } from './entities/reset-token.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    
    @InjectRepository(UserAuthentication)
    private readonly userAuthRepository: Repository<UserAuthentication>,
    
    @InjectRepository(ResetToken)
    private resetTokenRepo: Repository<ResetToken>,
    
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  // Find user by email
  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }




  // Method for creating a regular user
  async create(createUserDto: CreateUserDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create User
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        userType: createUserDto.userType,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      // Step 2: Create UserProfile
      const userProfile = this.userProfileRepository.create({
        user: savedUser,
        name: createUserDto.name,
        company_name: createUserDto.companyName,
        phone_number: createUserDto.phone,
        cnic: createUserDto.cnic,
        address: createUserDto.address,
      });
      await queryRunner.manager.save(userProfile);

      // Step 3: Hash Password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // Step 4: Create UserAuthentication
      const userAuth = this.userAuthRepository.create({
        user: savedUser,
        passwordHash: hashedPassword,
        TwoFactorEnabled: false,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
      await queryRunner.manager.save(userAuth);

      // Step 5: Generate JWT Tokens
      const payload = { username: savedUser.username, sub: savedUser.user_id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Commit the transaction
      await queryRunner.commitTransaction();

      return {
        message: 'User created successfully',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Transaction failed: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // Method to handle forgot password and generate a reset token
  async forgotPassword(email: string) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      const resetToken = randomBytes(64).toString('hex');
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Expires in 1 hour

      let resetTokenObj = await this.resetTokenRepo.findOne({
        where: { userId: existingUser.user_id },
      });

      if (resetTokenObj) {
        resetTokenObj.token = resetToken;
        resetTokenObj.expiryDate = expiryDate;
      } else {
        resetTokenObj = this.resetTokenRepo.create({
          token: resetToken,
          userId: existingUser.user_id,
          expiryDate,
        });
      }

      await this.resetTokenRepo.save(resetTokenObj);
      // Send the email link (integration with email service required)
      // await this.mailService.sendPasswordResetEmail(email, resetToken);
    }
  }

  // Create user from Google OAuth
  async createUserFromGoogle(googleUser: any): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        email: googleUser.email,
        username: `${googleUser.firstName} ${googleUser.lastName}`,
        userType: 'Google',
        googleAuth: true,
        picture: googleUser.picture,
      });
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new Error('Error saving user to database: ' + error.message);
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Add method to find UserAuthentication by user ID
  async findAuthByUserId(userId: number): Promise<UserAuthentication> {
    return await this.userAuthRepository.findOne({ where: { user: { user_id: userId } } });
  }


  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['profile'],  // Make sure 'profile' exists in the User entity
    });
  }

  // Method to find user by email in UserRepository with UserAuthentication relation
  async findByEmailWithAuth(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['userAuth'],  // Load the UserAuthentication relationship for authentication purposes
    });
  }



  // Create new Google user
  async createGoogleUser(email: string): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      username: email.split('@')[0],  // Create username from email prefix
      userType: 'google',  // Optional: specify the user type for Google users
    });

    return await this.userRepository.save(newUser);  // Ensure it saves a User entity
  }

  // Optionally, you can add a method to create a new user with authentication data for simple signup
  async createUserWithAuth(
    email: string, 
    username: string, 
    passwordHash: string
  ): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      username,
      userType: 'local',  // Optional: specify the user type for local users
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create UserAuthentication record with the hashed password
    const userAuth = new UserAuthentication();
    userAuth.user = savedUser;
    userAuth.passwordHash = passwordHash;
    // Save UserAuthentication data
    await this.userAuthRepository.save(userAuth);

    return savedUser;
  }
}