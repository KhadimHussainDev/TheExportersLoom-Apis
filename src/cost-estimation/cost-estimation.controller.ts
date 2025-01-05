import { Body, Controller, Post } from '@nestjs/common';
import { CostEstimationService } from './cost-estimation.service';

@Controller('cost-estimation')
export class CostEstimationController {
  constructor(private readonly costEstimationService: CostEstimationService) { }

  @Post()
  async getCostEstimation(@Body('userContent') userContent: string): Promise<any> {
    return await this.costEstimationService.getCostEstimation(userContent);
  }
}
