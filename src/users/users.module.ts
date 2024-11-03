import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { ResetToken } from './entities/reset-token.entity';  
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserAuthentication, ResetToken]),  
    forwardRef(() => AuthModule),  
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
