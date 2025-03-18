import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { RecommendBidsService } from './recommendBids.service';
import { JwtStrategy} from '../auth/jwt.strategy';

@Controller('recommend-bids')
export class RecommendBidsController {
  constructor(private readonly recommendBidsService: RecommendBidsService) {}

  @UseGuards(JwtStrategy)
  @Get()
  async getRecommendedBids(@Req() req) {
    console.log('🔹 Received User:', req.user); // Debug log

    if (!req.user) throw new UnauthorizedException('Unauthorized request'); 

    const manufacturerId = req.user.user_id;
    return this.recommendBidsService.getRecommendedBids(manufacturerId);
  }
}