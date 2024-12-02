import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stitching } from './entities/stitching.entity';
import { StitchingController } from './stitching.controller';
import { StitchingService } from './stitching.service';
import { Project } from '../../project/entities/project.entity';
import { BidModule } from '../../bid/bid.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Stitching, Project]),forwardRef(() => BidModule),],
  controllers: [StitchingController],
  providers: [StitchingService],
  exports: [StitchingService],
})
export class StitchingModule {}