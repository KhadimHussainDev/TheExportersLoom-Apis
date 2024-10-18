// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserProfile, UserAuthentication])],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
