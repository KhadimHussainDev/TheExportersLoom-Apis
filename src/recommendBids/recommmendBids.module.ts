import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendBidsController } from './recommendBids.controller';
import { RecommendBidsService } from './recommendBids.service';
import { Bid } from '../bid/entities/bid.entity';
import { User } from '../users/entities/user.entity';
import { Machine } from '../machines/entities/machine.entity';
import { MachineModule } from '../machines/machine.module';
import { OrderModule } from 'order/order.module';
import { Order } from 'order/entities/order.entity';
import { ReviewsModule } from 'reviews/reviews.module';
import { Reviews } from 'reviews/entities/reviews.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, User, Machine, Order, Reviews]),
  MachineModule, OrderModule, ReviewsModule],
  controllers: [RecommendBidsController],
  providers: [RecommendBidsService],
  
})
export class RecommendBidsModule {}
