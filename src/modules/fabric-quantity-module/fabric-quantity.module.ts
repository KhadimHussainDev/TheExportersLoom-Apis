import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricQuantityController } from './fabric-quantity.controller';
import { FabricQuantityService } from './fabric-quantity.service';
import { FabricQuantity } from './entities/fabric-quantity.entity';
import { FabricSizeCalculation } from '../../entities/fabric-size-calculation.entity';
import { BidModule } from '../../bid/bid.module'; // Import BidModule to access BidService
import { Project } from 'project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FabricQuantity, FabricSizeCalculation,Project]),
    forwardRef(() => BidModule),
  ],
  controllers: [FabricQuantityController],
  providers: [FabricQuantityService],
  exports: [FabricQuantityService],
})
export class FabricQuantityModule {}
