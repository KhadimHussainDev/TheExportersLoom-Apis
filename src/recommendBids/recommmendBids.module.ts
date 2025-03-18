import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendBidsController } from './recommendBids.controller';
import { RecommendBidsService } from './recommendBids.service';
import { Bid } from '../bid/entities/bid.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, User])],
  controllers: [RecommendBidsController],
  providers: [RecommendBidsService],
})
export class RecommendBidsModule {}
