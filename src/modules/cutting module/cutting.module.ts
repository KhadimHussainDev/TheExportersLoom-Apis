import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuttingService } from './cutting.service';
import { Cutting } from './entities/cutting.entity';
import { CuttingController } from './cutting.controller';
import { RegularCutting } from '../../entities/regular-cutting.entity';
import { SublimationCutting } from '../../entities/sublimation-cutting.entity';
import { BidModule } from '../../bid/bid.module';  // Import BidModule to access BidService

@Module({
  imports: [ 
    TypeOrmModule.forFeature([Cutting, RegularCutting, SublimationCutting]),
    forwardRef(() => BidModule),
  ],
  controllers: [CuttingController],
  providers: [CuttingService],
  exports: [CuttingService],
})
export class CuttingModule {}
