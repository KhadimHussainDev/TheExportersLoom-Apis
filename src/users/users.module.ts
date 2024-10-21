import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, UserAuthentication])], 
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],  
})
export class UsersModule {}
