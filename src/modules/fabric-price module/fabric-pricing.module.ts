import { Module, forwardRef } from '@nestjs/common';
import { FabricPricingService } from './fabric-pricing.service';
import { FabricPricingController } from './fabric-pricing.controller';
import { ProjectModule } from '../../project/project.module'; // Correct import path

@Module({
  imports: [forwardRef(() => ProjectModule)],
  providers: [FabricPricingService],
  controllers: [FabricPricingController],
})
export class FabricPricingModule {}
