import { 
  Controller, 
  Get, 
  UseGuards, 
  Req, 
  UnauthorizedException 
} from '@nestjs/common';
import { RecommendBidsService } from './recommendBids.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { HttpStatus } from '@nestjs/common';

@Controller('recommend-bids')
export class RecommendBidsController {
  constructor(private readonly recommendBidsService: RecommendBidsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getRecommendedBids(@Req() req): Promise<ApiResponseDto<any>> {
    console.log('🔹 Received User:', req.user);

    if (!req.user) {
      throw new UnauthorizedException('Unauthorized request'); 
    }

    const manufacturerId = req.user.user_id;

    const recommendedBids = await this.recommendBidsService.getRecommendedBids(manufacturerId);

    return ApiResponseDto.success(
      HttpStatus.OK,
      'Recommended bids retrieved successfully',
      recommendedBids
    );
  }
}
