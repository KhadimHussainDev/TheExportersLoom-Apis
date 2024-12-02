import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricPricingService } from './fabric-pricing.service';
import { FabricPricingController } from './fabric-pricing.controller';
import { FabricPricing } from '../../entities/fabric-pricing.entity';
import { FabricPricingModule as FabricPricingEntityModule } from './entities/fabric-pricing-module.entity';
import { ProjectModule } from '../../project/project.module';
import { Project } from '../../project/entities/project.entity';
import { FabricQuantityModule } from '../fabric-quantity-module/fabric-quantity.module';
import { BidModule } from '../../bid/bid.module';  // Import BidModule to access BidService

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FabricPricing,
      FabricPricingEntityModule,
      Project,
    ]),
    forwardRef(() => ProjectModule),  // Use forwardRef for circular dependencies
    forwardRef(() => BidModule),
    FabricQuantityModule,
  ],
  providers: [FabricPricingService],
  controllers: [FabricPricingController],
  exports: [FabricPricingService],
})
export class FabricPricingModule {}
