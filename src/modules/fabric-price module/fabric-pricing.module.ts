import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricPricingService } from './fabric-pricing.service';
import { FabricPricingController } from './fabric-pricing.controller';
import { FabricPricing } from './entities/fabric-pricing.entity';
import { ProjectModule } from '../../project/project.module'; // Correct import path
import { Project } from 'src/project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FabricPricing, Project]),
    forwardRef(() => ProjectModule), // Use forwardRef to handle circular dependency
  ],
  providers: [FabricPricingService],
  controllers: [FabricPricingController],
  exports: [FabricPricingService],
})
export class FabricPricingModule {}
