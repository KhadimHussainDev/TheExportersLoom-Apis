import { Controller, Get, Param, Delete } from '@nestjs/common';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}
  
  @Get()
  async getAllBids(): Promise<Bid[]> {
    return this.bidService.getAllBids();
  }

  @Delete('/:id') // DELETE /bids/:id
  async deactivateBid(@Param('id') bidId: number): Promise<Bid> {
    return this.bidService.deactivateBid(bidId);
  }
}
