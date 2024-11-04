import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { ResetToken } from './entities/reset-token.entity';  
import { AuthModule } from '../auth/auth.module';
import { MailService } from './services/mail.service';
import { EmailVerificationToken } from './entities/email-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserAuthentication,
      ResetToken,
      EmailVerificationToken
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
