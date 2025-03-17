import { Body, Controller, Delete, Get, HttpStatus, Param, Put } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { BidService } from './bid.service';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid } from './entities/bid.entity';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) { }

  @Get()
  async getAllBids(): Promise<ApiResponseDto<Bid[]>> {
    const bids = await this.bidService.getAllBids();
    return ApiResponseDto.success(HttpStatus.OK, 'Bids retrieved successfully', bids);
  }

  @Delete('/:id') // DELETE /bids/:id
  async deactivateBid(@Param('id') bidId: number): Promise<ApiResponseDto<Bid>> {
    const bid = await this.bidService.deactivateBid(bidId);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid deactivated successfully', bid);
  }

  @Put('/:id')
  async editBid(
    @Param('id') bidId: number,
    @Body() updateBidDto: UpdateBidDto,
  ): Promise<ApiResponseDto<Bid>> {
    // console.log(updateBidDto); // Log to see the actual data received
    // console.log('Received Price:', updateBidDto.price);
    if (updateBidDto.price) {
      updateBidDto.price = parseFloat(updateBidDto.price.toString()); // Convert to number if needed
    }

    const updatedBid = await this.bidService.editBid(bidId, updateBidDto);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid updated successfully', updatedBid);
  }
}
