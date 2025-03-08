import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) { }

    @Get(':exporterId/:bidId')
    async getRecommendations(
        @Param('exporterId') exporterId: string,
        @Param('bidId') bidId: string
    ): Promise<ApiResponseDto<any>> {
        const recommendations = await this.recommendationService.getRecommendedManufacturers(
            parseInt(exporterId, 10),
            parseInt(bidId, 10)
        );

        return ApiResponseDto.success(
            HttpStatus.OK,
            'Recommendations retrieved successfully',
            recommendations
        );
    }
}