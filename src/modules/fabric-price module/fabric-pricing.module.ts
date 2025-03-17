import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricPricing } from '../../entities/fabric-pricing.entity';
import { Project } from '../../project/entities/project.entity';
import { FabricPricingModule as FabricPricingModuleEntity } from './entities/fabric-pricing-module.entity';
import { FabricPricingController } from './fabric-pricing.controller';
import { FabricPricingService } from './fabric-pricing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FabricPricing,
      FabricPricingModuleEntity,
      Project,
    ]),
  ],
  controllers: [FabricPricingController],
  providers: [FabricPricingService],
  exports: [FabricPricingService],
})
export class FabricPricingModule { }
