import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricPricing } from '../../entities/fabric-pricing.entity';
import { Project } from '../../project/entities/project.entity';
import { UsersModule } from '../../users/users.module';
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
    forwardRef(() => UsersModule),
  ],
  controllers: [FabricPricingController],
  providers: [FabricPricingService],
  exports: [FabricPricingService],
})
export class FabricPricingModule { }
