import { Module } from '@nestjs/common';
import { CostEstimationService } from './cost-estimation.service';
import { CostEstimationController } from './cost-estimation.controller';

@Module({
  providers: [CostEstimationService],
  controllers: [CostEstimationController]
})
export class CostEstimationModule {}
