// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './entities/user.entity';
// import { UserProfile } from './entities/user-profile.entity';
// import { UserAuthentication } from '../auth/entities/auth.entity';
// import { CreateUserDto } from './dto/create-user.dto';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
// import { DataSource } from 'typeorm'; // Import DataSource for transactions

// @Injectable()
// export class UsersService {
//     private users = [];
//     constructor(
//         @InjectRepository(User) private userRepository: Repository<User>,
//         @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
//         @InjectRepository(UserAuthentication) private userAuthRepository: Repository<UserAuthentication>,
//         private jwtService: JwtService,
//         private dataSource: DataSource, // Inject DataSource
//     ) {}

//     async create(createUserDto: CreateUserDto): Promise<any> {
//         const queryRunner = this.dataSource.createQueryRunner();
//         await queryRunner.connect();
//         await queryRunner.startTransaction();

//         try {
//             // Step 1: Create User
//             const newUser = this.userRepository.create({
//                 username: createUserDto.username,
//                 email: createUserDto.email,
//                 userType: createUserDto.userType,
//             });
//             const savedUser = await queryRunner.manager.save(newUser);

//             // Step 2: Create UserProfile
//             const userProfile = this.userProfileRepository.create({
//                 user: savedUser,
//                 name: createUserDto.name,
//                 company_name: createUserDto.companyName,
//                 phone_number: createUserDto.phone,
//                 cnic: createUserDto.cnic,
//                 address: createUserDto.address,
//             });
//             await queryRunner.manager.save(userProfile);

//             // Step 3: Hash Password
//             const salt = await bcrypt.genSalt();
//             const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

//             // Step 4: Create UserAuthentication
//             const userAuth = this.userAuthRepository.create({
//                 user: savedUser,
//                 passwordHash: hashedPassword,
//                 TwoFactorEnabled: false,
//                 isEmailVerified: false,
//                 isPhoneVerified: false,
//             });
//             await queryRunner.manager.save(userAuth);

//             // Step 5: Generate JWT Tokens
//             const payload = { username: savedUser.username, sub: savedUser.user_id };
//             const accessToken = this.jwtService.sign(payload);
//             const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

//             // Commit the transaction
//             await queryRunner.commitTransaction();

//             // Return tokens
//             return {
//                 message: 'User created successfully',
//                 accessToken,
//                 refreshToken,
//             };

//         } catch (error) {
//             // Rollback the transaction if any operation fails
//             await queryRunner.rollbackTransaction();
//             throw new Error('Transaction failed: ' + error.message);

//         } finally {
//             // Release the query runner
//             await queryRunner.release();
//         }
//     }
    
//     async createUser(createUserDto: any) {
//         const user = {
//           ...createUserDto,
//           id: this.users.length + 1, // Mock ID generation for simplicity
//         };
    
//         this.users.push(user);
//         return user;
//       }

//     async createUserFromGoogle(googleUser: any) {
//         const user = {
//           email: googleUser.email,
//           firstName: googleUser.firstName,
//           lastName: googleUser.lastName,
//           picture: googleUser.picture,
//           googleAuth: true,  // Flag indicating this is a Google user
//         };
    
//         this.users.push(user);
//         return user;
//       }
    
//       findUserByEmail(email: string) {
//         return this.users.find((user) => user.email === email);
//       }
// }
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

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(UserProfile) private userProfileRepository: Repository<UserProfile>,
        @InjectRepository(UserAuthentication) private userAuthRepository: Repository<UserAuthentication>,
        private jwtService: JwtService,
        private dataSource: DataSource,
    ) {}

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

            return { message: 'User created successfully', accessToken, refreshToken };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error('Transaction failed: ' + error.message);
        } finally {
            await queryRunner.release();
        }
    }

    // Create user from Google OAuth
    // async createUserFromGoogle(googleUser: any) {
    //     // Ensure username is unique; for example, we could use their Google email as the username
    //     const newUser = this.userRepository.create({
    //         email: googleUser.email,
    //         username: googleUser.firstName + ' ' + googleUser.lastName,  // Setting Google firstName + lastName as the username
    //         userType: 'Google', // Assuming this is the userType for Google users
    //         googleAuth: true,  // Mark this user as signed up via Google
    //         picture: googleUser.picture, // Storing Google profile picture
    //     });
    //     return this.userRepository.save(newUser);
    // }

    // // Find a user by email (useful for Google OAuth)
    // findUserByEmail(email: string) {
    //     return this.userRepository.findOne({ where: { email } });
    // }
    async createUserFromGoogle(googleUser: any): Promise<User> {
        try {
          console.log('Attempting to create a new user from Google OAuth:', googleUser);
      
          const newUser = this.userRepository.create({
            email: googleUser.email,
            username: `${googleUser.firstName} ${googleUser.lastName}`,
            userType: 'Google',
            googleAuth: true,
            picture: googleUser.picture,
          });
          
          const savedUser = await this.userRepository.save(newUser);  // Save the user to DB
      
          console.log('User successfully saved to the database:', savedUser);
          return savedUser;
      
        } catch (error) {
          console.error('Error saving user to database:', error);
          throw new Error('Database save failed');
        }
      }
      async findUserByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOne({ where: { email } });
      }
}      