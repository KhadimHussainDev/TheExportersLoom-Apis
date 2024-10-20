// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { nanoid } from 'nanoid';
import { randomBytes } from 'crypto';
import { ResetToken } from './entities/reset-token.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserAuthentication)
    private userAuthRepository: Repository<UserAuthentication>,
    @InjectRepository(ResetToken)
    private resetTokenRepo: Repository<ResetToken>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    // Step 1: Create the User
    const newUser = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      userType: createUserDto.userType,
    });
    const savedUser = await this.userRepository.save(newUser);

    // Step 2: Create the UserProfile
    const userProfile = this.userProfileRepository.create({
      user: savedUser, // Set the foreign key
      name: createUserDto.name,
      company_name: createUserDto.companyName,
      phone_number: createUserDto.phone,
      cnic: createUserDto.cnic,
      address: createUserDto.address,
    });
    await this.userProfileRepository.save(userProfile);

    // Step 3: Create the UserAuthentication
    const userAuth = this.userAuthRepository.create({
      user: savedUser, // Set the foreign key
      passwordHash: createUserDto.password, // In a real app, hash this password
      TwoFactorEnabled: false,
      isEmailVerified: false,
      isPhoneVerified: false,
    });
    await this.userAuthRepository.save(userAuth);

    return {
      success: true,
      message: 'User, profile, and authentication created successfully',
    };
  }
  async findWithEmail(email: string) {
    if (email) return this.userRepository.findOneBy({ email });
  }
  async forgotPassword(email: string) {
    //Check whether user exist with this email
    const existingUser = await this.findWithEmail(email);
    var resetToken = '';
    if (existingUser) {
      //Random reset token
      const resetToken = randomBytes(64).toString('hex');
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Expires in 1 hour

      //Find if token already exist for this user
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

      //Send the email link
      //await this.mailService.sendPasswordResetEmail(email, resetToken);
    }
  }
}
