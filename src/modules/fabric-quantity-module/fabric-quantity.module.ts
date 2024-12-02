import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricQuantityController } from './fabric-quantity.controller';
import { FabricQuantityService } from './fabric-quantity.service';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { BidModule } from '../../bid/bid.module'; // Import BidModule to access BidService

@Module({
  imports: [
    TypeOrmModule.forFeature([FabricQuantity, FabricSizeCalculation]),
    forwardRef(() => BidModule),
  ],
  controllers: [FabricQuantityController],
  providers: [FabricQuantityService],
  exports: [FabricQuantityService],
})
export class FabricQuantityModule {}
