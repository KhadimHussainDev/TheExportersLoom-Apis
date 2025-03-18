import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendBidsController } from './recommendBids.controller';
import { RecommendBidsService } from './recommendBids.service';
import { Bid } from '../bid/entities/bid.entity';
import { User } from '../users/entities/user.entity';
import { Machine } from 'machines/entities/machine.entity';
import { MachineModule } from '../machines/machine.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, User, Machine]),
  MachineModule,],
  controllers: [RecommendBidsController],
  providers: [RecommendBidsService],
  
})
export class RecommendBidsModule {}
