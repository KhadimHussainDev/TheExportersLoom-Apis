// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
        @InjectRepository(UserAuthentication) private userAuthRepository: Repository<UserAuthentication>,
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
            user: savedUser,  // Set the foreign key
            name: createUserDto.name,
            company_name: createUserDto.companyName,
            phone_number: createUserDto.phone,
            cnic: createUserDto.cnic,
            address: createUserDto.address,
        });
        await this.userProfileRepository.save(userProfile);

        // Step 3: Create the UserAuthentication
        const userAuth = this.userAuthRepository.create({
            user: savedUser,  // Set the foreign key
            passwordHash: createUserDto.password,  // In a real app, hash this password
            TwoFactorEnabled: false,
            isEmailVerified: false,
            isPhoneVerified: false,
        });
        await this.userAuthRepository.save(userAuth);

        return { success: true, message: 'User, profile, and authentication created successfully' };
    }
}
