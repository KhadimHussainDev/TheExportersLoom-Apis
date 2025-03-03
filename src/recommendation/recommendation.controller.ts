import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) {}

    @Get(':exporterId')
    async getRecommendations(@Param('exporterId') exporterId: number) {
        return this.recommendationService.getRecommendedManufacturers(exporterId);
    }
}