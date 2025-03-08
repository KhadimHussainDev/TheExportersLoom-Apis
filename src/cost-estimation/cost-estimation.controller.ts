import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CostEstimationService } from './cost-estimation.service';

@Controller('cost-estimation')
export class CostEstimationController {
  constructor(private readonly costEstimationService: CostEstimationService) { }

  @Post()
  async getCostEstimation(@Body('userContent') userContent: string): Promise<ApiResponseDto<any>> {
    const estimation = await this.costEstimationService.getCostEstimation(userContent);
    return ApiResponseDto.success(HttpStatus.OK, 'Cost estimation retrieved successfully', estimation);
  }
}
