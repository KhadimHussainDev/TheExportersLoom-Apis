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
import { randomBytes } from 'crypto';
import { ResetToken } from './entities/reset-token.entity';
import { UnauthorizedException } from '@nestjs/common';

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

  // Creating regular user/regular signup
  async create(createUserDto: CreateUserDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Check if the user already exists by email
      const existingUser = await this.findUserByEmail(createUserDto.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create User
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        userType: createUserDto.userType,
      });
      const savedUser = await queryRunner.manager.save(newUser);

      // Create UserProfile
      const userProfile = this.userProfileRepository.create({
        user: savedUser,
        name: createUserDto.name,
        company_name: createUserDto.companyName,
        phone_number: createUserDto.phone,
        cnic: createUserDto.cnic,
        address: createUserDto.address,
      });
      await queryRunner.manager.save(userProfile);

      // Hash Password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      // Create UserAuthentication
      const userAuth = this.userAuthRepository.create({
        user: savedUser,
        passwordHash: hashedPassword,
        TwoFactorEnabled: false,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
      await queryRunner.manager.save(userAuth);

      // Generate JWT Tokens
      const payload = { username: savedUser.username, sub: savedUser.user_id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      await queryRunner.commitTransaction();

      return {
        message: 'User created successfully',
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction failed: ', error.message);
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
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }
  
  // Validate user credentials for regular login
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmailWithAuth(email); 

    if (!user || !user.userAuth || user.userAuth.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userAuth = user.userAuth[0];  
    const isPasswordValid = await bcrypt.compare(password, userAuth.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { passwordHash, ...result } = userAuth;
    return result;
  }
 
  // Generate JWT token after successful login
  async login(user: any) {
    const payload = { username: user.username, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['profile'], 
    });
  }

  // Method to find user by email in UserRepository with UserAuthentication relation
  async findByEmailWithAuth(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['userAuth'], 
    });
  }

}
