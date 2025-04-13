import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MachineModule } from '../machines/machine.module';
import { OrderModule } from '../order/order.module';
import { UsersModule } from '../users/users.module';
import { Reviews } from './entities/reviews.entity';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews]),
    forwardRef(() => UsersModule),
    MachineModule,
    forwardRef(() => OrderModule)
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService,TypeOrmModule]
})
export class ReviewsModule { }
