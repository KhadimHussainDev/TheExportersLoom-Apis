import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { ResetToken } from './entities/reset-token.entity';  // Import ResetToken entity

import { AuthModule } from '../auth/auth.module';  // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserAuthentication, ResetToken]),  // Include ResetToken
    forwardRef(() => AuthModule),  // Import AuthModule which provides JwtService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Export UsersService for use in other modules
})
export class UsersModule {}
