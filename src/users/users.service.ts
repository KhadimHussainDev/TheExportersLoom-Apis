import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { ReviewsService } from 'reviews/reviews.service';
import { DataSource, ILike, MoreThan, Repository } from 'typeorm';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { VERIFICATION } from '../common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { EmailVerificationToken } from './entities/email-verification.entity';
import { ResetToken } from './entities/reset-token.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { MailService } from './services/mail.service';

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
    @InjectRepository(EmailVerificationToken)
    private emailVerificationTokenRepo: Repository<EmailVerificationToken>,

    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewService: ReviewsService,

    private jwtService: JwtService,
    private dataSource: DataSource,
    private readonly mailService: MailService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if the user already exists by email
      const existingUser = await this.findUserByEmail(createUserDto.email);
      if (existingUser) {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }

      // Create User instance
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        userType: createUserDto.userType,
      });

      // Save User to get the user_id
      const savedUser = await queryRunner.manager.save(newUser);

      // Create and save UserProfile, linking it to the saved User
      const userProfile = this.userProfileRepository.create({
        user: savedUser, // Link the profile to the saved user
        name: createUserDto.name,
        company_name: createUserDto.companyName,
        phone_number: createUserDto.phone,
        cnic: createUserDto.cnic,
        address: createUserDto.address,
      });
      const savedProfile = await queryRunner.manager.save(userProfile);

      // Update User to reference the saved UserProfile
      savedUser.profile = savedProfile;
      await queryRunner.manager.save(savedUser);

      // Hash Password and create UserAuthentication entry
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      const userAuth = this.userAuthRepository.create({
        user: savedUser,
        passwordHash: hashedPassword,
        TwoFactorEnabled: false,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
      await queryRunner.manager.save(userAuth);

      // Generate JWT Tokens
      const accessToken = this.generateToken(savedUser)

      await queryRunner.commitTransaction();

      return { accessToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }

  // Updated method to use ServiceResponseDto
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async getUserProfile(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile' ,'exportedOrders','manufacturedOrders'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // get average rating of the user
    const averageRating = await this.reviewService.getUserAverageRating(id);
    return {
      name: user.profile.name,
      username: user.username,
      email: user.email,
      phoneNo: user.profile.phone_number,
      address: user.profile.address,
      picture: user.profile.profile_picture || user.picture,
      companyName: user.profile.company_name,
      cnic: user.profile.cnic,
      bio: user.profile.bio,
      averageRating: averageRating.avgRating,
      totalOrders: user.exportedOrders.length + user.manufacturedOrders.length,
    };
  }

  // Method to handle forgot password and generate a reset token

  async forgotPassword(email: string) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      // Generate a 6-digit reset code
      const resetCode = randomInt(VERIFICATION.CODE_MIN, VERIFICATION.CODE_MAX).toString();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + VERIFICATION.EXPIRY_HOURS); // Expires in 24 hours

      // Check if there's an existing reset code entry for the user
      let resetTokenObj = await this.resetTokenRepo.findOne({
        where: { userId: existingUser.user_id },
      });

      if (resetTokenObj) {
        resetTokenObj.token = resetCode;
        resetTokenObj.expiryDate = expiryDate;
      } else {
        resetTokenObj = this.resetTokenRepo.create({
          token: resetCode,
          userId: existingUser.user_id,
          expiryDate,
        });
      }

      await this.resetTokenRepo.save(resetTokenObj);

      // Send the email with the reset code
      try {
        await this.mailService.sendMail(
          existingUser.email,
          'Password Reset Code',
          `Your password reset code is: ${resetCode} \n\nThis code will expire in ${VERIFICATION.EXPIRY_HOURS} hours`,
        );
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        throw new HttpException('Failed to send password reset email. Try again later', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        message: 'Reset password code sent to the specified email'
      };
    } else {
      throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
    }
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const token = await this.resetTokenRepo.findOne({
      where: { token: resetToken, expiryDate: MoreThan(new Date()) },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid Code or Code Expired!!');
    }
    this.resetTokenRepo.remove(token);

    const existingUser = await this.findOne(token.userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    if (existingUser.email !== email) {
      throw new UnauthorizedException('Invalid Email');
    }
    const authUser = await this.userAuthRepository.findOne({
      where: { user: { user_id: existingUser.user_id } },
    });
    authUser.passwordHash = await this.encrypt(newPassword);
    await this.userAuthRepository.save(authUser);
    return { message: 'Password has been changed!!' };
  }
  async encrypt(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  async requestEmailVerification(email: string) {
    const existingUser = await this.findUserByEmail(email);
    if (!existingUser) {
      throw new UnauthorizedException('Invalid Email');
    }

    // Generate a 6-digit random number for verification
    const verificationCode = randomInt(VERIFICATION.CODE_MIN, VERIFICATION.CODE_MAX).toString();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + VERIFICATION.EXPIRY_HOURS);

    // Save or update the verification code with expiry in the database
    const existingToken = await this.emailVerificationTokenRepo.findOne({
      where: { userId: existingUser.user_id },
    });

    if (existingToken) {
      // Update existing token
      existingToken.token = verificationCode;
      existingToken.expiryDate = expiryDate;
      await this.emailVerificationTokenRepo.save(existingToken);
    } else {
      // Create a new token entry
      await this.emailVerificationTokenRepo.save({
        token: verificationCode,
        userId: existingUser.user_id,
        expiryDate,
      });
    }

    // Send the verification code via email
    this.mailService.sendMail(
      existingUser.email,
      'Email Verification',
      `Your verification code is: ${verificationCode}\n\nThis code will expire in ${VERIFICATION.EXPIRY_HOURS} hours.`,
    );

    return {
      message: 'Verification code sent to the specified email',
      verificationCode,
    };
  }
  async verifyEmail(email: string, verificationCode: string) {
    // Find the user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email address');
    }

    // Retrieve the verification code entry for the user
    const verificationEntry = await this.emailVerificationTokenRepo.findOne({
      where: { userId: user.user_id },
    });

    if (!verificationEntry) {
      throw new UnauthorizedException('Verification code not found');
    }

    // Check if the code matches and is still valid
    if (verificationEntry.token !== verificationCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (verificationEntry.expiryDate < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    const authUser = await this.userAuthRepository.findOne({
      where: { user: { user_id: user.user_id } },
    });
    if (!authUser) {
      throw new UnauthorizedException('User not found');
    }
    authUser.isEmailVerified = true;
    await this.userAuthRepository.save(authUser);

    // Delete the verification entry from the database
    await this.emailVerificationTokenRepo.delete({ userId: user.user_id });

    return { message: 'Email verified successfully' };
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ 
      where: { 
        email: ILike(email)
      } 
    });
  }

  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.findByEmailWithAuth(email);
    if (!user || !user.userAuth || user.userAuth.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userAuth = user.userAuth[0];
    const isPasswordValid = await bcrypt.compare(
      password,
      userAuth.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { accessToken: this.generateToken(user) };
  }

  // Generate JWT token after successful login
  generateToken(user: User): string {
    const payload = {
      userId: user.user_id,
      username: user.username,
      userType: user.userType,

    };
    return this.jwtService.sign(payload);
  }

  //get all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['profile'],
    });
  }

  //get user by id
  async findOneById(id: number): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile'],
    });
  }

  // find user by email in UserRepository with UserAuthentication relation
  async findByEmailWithAuth(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email: ILike(email) },
      relations: ['userAuth'],
    });
  }

  async deleteUserById(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isActive = false;
    await this.userRepository.save(user);
    return { message: 'User status set to inactive successfully' };
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the existing user
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new HttpException(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
      }

      // Update User fields
      if (updateUserDto.username) user.username = updateUserDto.username;
      if (updateUserDto.email) user.email = updateUserDto.email;
      if (updateUserDto.picture) user.picture = updateUserDto.picture;

      // Update UserProfile fields
      if (user.profile) {
        if (updateUserDto.name) user.profile.name = updateUserDto.name;
        if (updateUserDto.company_name)
          user.profile.company_name = updateUserDto.company_name;
        if (updateUserDto.phone_number)
          user.profile.phone_number = updateUserDto.phone_number;
        if (updateUserDto.cnic) user.profile.cnic = updateUserDto.cnic;
        if (updateUserDto.address) user.profile.address = updateUserDto.address;
        if (updateUserDto.bio) user.profile.bio = updateUserDto.bio;
        if (updateUserDto.picture) user.profile.profile_picture = updateUserDto.picture;

        // Save updated profile
        await queryRunner.manager.save(user.profile);
      }

      // Save the updated User entity
      const updatedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Transaction failed: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }
}
