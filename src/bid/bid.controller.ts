import { Controller, Get, Param, Delete, Body, Put } from '@nestjs/common';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';
import { UpdateBidDto } from './dto/update-bid.dto';

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

  @Put('/:id')
  async editBid(
    @Param('id') bidId: number,
    @Body() updateBidDto: UpdateBidDto,
  ) {
    console.log(updateBidDto); // Log to see the actual data received
    console.log('Received Price:', updateBidDto.price);
    if (updateBidDto.price) {
      updateBidDto.price = parseFloat(updateBidDto.price.toString()); // Convert to number if needed
    }

    return this.bidService.editBid(bidId, updateBidDto);
  }
}
