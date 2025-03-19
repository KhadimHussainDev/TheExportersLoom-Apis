import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGuard } from '../auth';
import { STATUS } from '../common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { User } from '../users/entities/user.entity';
import { BidService } from './bid.service';
import { CreateBidResponseDto } from './dto/create-bid-response.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidResponseDto } from './dto/update-bid-response.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidResponse } from './entities/bid-response.entity';
import { Bid } from './entities/bid.entity';

@Controller('bid')
@UseGuards(JwtAuthGuard)
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

  @Post()
  async createBid(
    @GetUser() user: User,
    @Body() createBidDto: CreateBidDto,
  ): Promise<ApiResponseDto<Bid>> {
    const bid = await this.bidService.createBid(
      user.user_id,
      createBidDto.moduleId,
      createBidDto.title,
      createBidDto.description,
      createBidDto.price,
      STATUS.ACTIVE,
      createBidDto.moduleType,
    );
    return ApiResponseDto.success(HttpStatus.CREATED, 'Bid created successfully', bid);
  }

  // Get a bid with its responses
  @Get('/:id/with-responses')
  async getBidWithResponses(@Param('id') bidId: number): Promise<ApiResponseDto<Bid>> {
    const bid = await this.bidService.getBidWithResponses(bidId);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid with responses retrieved successfully', bid);
  }

  // Get all responses for a bid
  @Get('/:id/responses')
  async getBidResponses(@Param('id') bidId: number): Promise<ApiResponseDto<BidResponse[]>> {
    const responses = await this.bidService.getBidResponses(bidId);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid responses retrieved successfully', responses);
  }

  // Create a response to a bid (manufacturer responding to exporter's bid)
  @Post('/responses')
  async createBidResponse(
    @GetUser() user: User,
    @Body() createBidResponseDto: CreateBidResponseDto,
  ): Promise<ApiResponseDto<BidResponse>> {
    const response = await this.bidService.createBidResponse(
      user.user_id,
      createBidResponseDto,
    );
    return ApiResponseDto.success(HttpStatus.CREATED, 'Bid response created successfully', response);
  }

  // Get all responses by the current manufacturer
  @Get('/responses/my-responses')
  async getMyResponses(@GetUser() user: User): Promise<ApiResponseDto<BidResponse[]>> {
    const responses = await this.bidService.getManufacturerResponses(user.user_id);
    return ApiResponseDto.success(HttpStatus.OK, 'Your responses retrieved successfully', responses);
  }

  // Update a bid response
  @Put('/responses/:id')
  async updateBidResponse(
    @GetUser() user: User,
    @Param('id') responseId: number,
    @Body() updateBidResponseDto: UpdateBidResponseDto,
  ): Promise<ApiResponseDto<BidResponse>> {
    const response = await this.bidService.updateBidResponse(
      responseId,
      user.user_id,
      updateBidResponseDto,
    );
    return ApiResponseDto.success(HttpStatus.OK, 'Bid response updated successfully', response);
  }

  // Accept a bid response (exporter accepting manufacturer's response)
  @Put('/responses/:id/accept')
  async acceptBidResponse(
    @GetUser() user: User,
    @Param('id') responseId: number,
  ): Promise<ApiResponseDto<BidResponse>> {
    const response = await this.bidService.acceptBidResponse(responseId, user.user_id);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid response accepted successfully', response);
  }

  // Reject a bid response (exporter rejecting manufacturer's response)
  @Put('/responses/:id/reject')
  async rejectBidResponse(
    @GetUser() user: User,
    @Param('id') responseId: number,
  ): Promise<ApiResponseDto<BidResponse>> {
    const response = await this.bidService.rejectBidResponse(responseId, user.user_id);
    return ApiResponseDto.success(HttpStatus.OK, 'Bid response rejected successfully', response);
  }

  // Get bid by moduleId and moduleType
  @Get('/module/:moduleId')
  async getBidByModuleId(
    @Param('moduleId') moduleId: number,
    @Query('moduleType') moduleType: string
  ): Promise<ApiResponseDto<Bid>> {
    try {
      const bid = await this.bidService.findBidByModuleId(moduleId, moduleType);
      return ApiResponseDto.success(HttpStatus.OK, 'Bid retrieved successfully', bid);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return ApiResponseDto.error(HttpStatus.NOT_FOUND, error.message, null);
      }
      throw error;
    }
  }
}
