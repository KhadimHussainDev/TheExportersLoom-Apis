import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) {}

    @Get(':exporterId/:bidId')
    async getRecommendations(
        @Param('exporterId') exporterId: string,
        @Param('bidId') bidId: string
    ) {
        return this.recommendationService.getRecommendedManufacturers(
            parseInt(exporterId, 10),
            parseInt(bidId, 10)
        );
    }
}
