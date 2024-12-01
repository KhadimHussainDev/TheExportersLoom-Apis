import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';
import { FabricPricingModule } from '../modules/fabric-price module/entities/fabric-pricing-module.entity';  // Adjust path if needed
import { FabricQuantity } from '../modules/fabric-quantity-module/entities/fabric-quantity.entity';  // Adjust path if needed
import { User } from '../users/entities/user.entity'; // Adjust path if needed
import { Project } from '../project/entities/project.entity'; // Adjust path if needed

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, User, FabricPricingModule,FabricQuantity, Project])  // Make sure FabricPricingModule is included here
  ],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
