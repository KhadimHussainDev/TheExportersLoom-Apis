import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserAuthentication } from '../auth/entities/auth.entity';
import { OrderModule } from '../order/order.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { EmailVerificationToken } from './entities/email-verification.entity';
import { ResetToken } from './entities/reset-token.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { MailService } from './services/mail.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserAuthentication,
      ResetToken,
      EmailVerificationToken,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ReviewsModule),
    forwardRef(() => OrderModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, MailService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule { }
