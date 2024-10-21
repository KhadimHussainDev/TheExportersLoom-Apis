import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity'; // Add UserProfile entity
import { UserAuthentication } from '../auth/entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserProfile) // Add UserProfile Repository
    private readonly userProfileRepository: Repository<UserProfile>,  // This fixes the error

    @InjectRepository(UserAuthentication)
    private readonly userAuthRepository: Repository<UserAuthentication>,
  ) {}

  // Signup process (Create User, UserProfile, and UserAuthentication)
  async create(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({ 
        where: [{ email: createUserDto.email }, { username: createUserDto.username }]
      });
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Step 1: Create the User
    const newUser = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      userType: createUserDto.userType,
    });
    const savedUser = await this.userRepository.save(newUser);

    // Step 2: Create the UserProfile and link it to the created User
    const userProfile = this.userProfileRepository.create({
      user: savedUser,  // Link to the saved User
      name: createUserDto.name,
      company_name: createUserDto.companyName,
      phone_number: createUserDto.phone,
      cnic: createUserDto.cnic,
      address: createUserDto.address,
    });
    await this.userProfileRepository.save(userProfile);  // Save UserProfile

    // Step 3: Create the UserAuthentication and link it to the created User
    const userAuth = this.userAuthRepository.create({
      user: savedUser,
      passwordHash: createUserDto.password,  // IMPORTANT: Hash the password in production
      TwoFactorEnabled: false,
      isEmailVerified: false,
      isPhoneVerified: false,
    });
    await this.userAuthRepository.save(userAuth);

    return { success: true, message: 'User, profile, and authentication created successfully' };
  }

  // Find user by email
  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Method to find all users and include their profiles
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

  // Method to find user by email in UserRepository
  async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }
  // Add a method to find UserAuthentication by user_id
async findAuthByUserId(userId: number): Promise<UserAuthentication> {
  return await this.userAuthRepository.findOne({ where: { user: { user_id: userId } } });
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
