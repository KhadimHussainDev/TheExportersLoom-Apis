import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';
import { FabricPricingModule } from '../modules/fabric-price module/entities/fabric-pricing-module.entity';  // Adjust path if needed
import { FabricQuantity } from '../modules/fabric-quantity-module/entities/fabric-quantity.entity';  // Adjust path if needed
import { Cutting } from '../modules/cutting module/entities/cutting.entity';  // Adjust path if needed
import { User } from '../users/entities/user.entity'; // Adjust path if needed
import { Project } from '../project/entities/project.entity'; // Adjust path if needed
import { LogoPrinting } from '../modules/logo-printing module/entities/logo-printing.entity';
import { Packaging } from '../modules/packaging module/entities/packaging.entity';
import { Stitching } from '../modules/stitching module/entities/stitching.entity';
import { BidController } from './bid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, User, FabricPricingModule,FabricQuantity,Cutting,LogoPrinting,Packaging,Stitching, Project])  // Make sure FabricPricingModule is included here
  ],
  providers: [BidService],
  exports: [BidService],
  controllers: [BidController]
})
export class BidModule {}
