import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Bid } from '../bid/entities/bid.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, Reviews, Machine, Bid]), 
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
