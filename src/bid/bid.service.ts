import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { MODULE_TYPES, STATUS } from '../common';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { FabricPricingService } from '../modules/fabric-price module/fabric-pricing.service';
import { FabricQuantityService } from '../modules/fabric-quantity-module/fabric-quantity.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { PackagingService } from '../modules/packaging module/packaging.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { OrderService } from '../order/order.service';
import { User } from '../users/entities/user.entity';
import { CreateBidResponseDto } from './dto/create-bid-response.dto';
import { UpdateBidResponseDto } from './dto/update-bid-response.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidResponse } from './entities/bid-response.entity';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BidResponse)
    private readonly bidResponseRepository: Repository<BidResponse>,
    private readonly fabricPricingService: FabricPricingService,
    private readonly fabricQuantityService: FabricQuantityService,
    private readonly cuttingService: CuttingService,
    private readonly logoPrintingService: LogoPrintingService,
    private readonly packagingService: PackagingService,
    private readonly stitchingService: StitchingService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService
  ) { }
  async findOne(bidId: number): Promise<Bid> {
    // Find the bid by its ID
    const bid = await this.bidRepository.findOne({
      where: { bid_id: bidId },
    });

    if (!bid) {
      throw new Error(`Bid with ID ${bidId} not found.`);
    }

    return bid;
  }
  async createBid(
    userId: number,
    moduleId: number,
    title: string,
    description: string,
    price: number,
    status: string,
    module_type: typeof MODULE_TYPES[keyof typeof MODULE_TYPES],
  ): Promise<Bid> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Update the module status based on the module_type
    if (module_type === MODULE_TYPES.FABRIC_PRICING) {
      await this.fabricPricingService.updateFabricPricingStatus(moduleId, STATUS.POSTED);
    } else if (module_type === MODULE_TYPES.FABRIC_QUANTITY) {
      await this.fabricQuantityService.updateFabricQuantityStatus(moduleId, STATUS.POSTED);
    } else if (module_type === MODULE_TYPES.CUTTING) {
      await this.cuttingService.updateCuttingStatus(moduleId, STATUS.POSTED);
    } else if (module_type === MODULE_TYPES.LOGO_PRINTING) {
      await this.logoPrintingService.updateLogoPrintingStatus(moduleId, STATUS.POSTED);
    } else if (module_type === MODULE_TYPES.PACKAGING) {
      await this.packagingService.updatePackagingBagsStatus(moduleId, STATUS.POSTED);
    } else if (module_type === MODULE_TYPES.STITCHING) {
      await this.stitchingService.updateStitchingStatus(moduleId, STATUS.POSTED);
    } else {
      throw new Error('Invalid module_type provided.');
    }

    // Create and save the new Bid
    const bid = new Bid();
    bid.user = user;
    bid.title = title;
    bid.description = description;
    bid.price = price;
    bid.status = status;
    bid.module_id = moduleId;
    bid.module_type = module_type;

    // Save the bid in the repository
    return this.bidRepository.save(bid);
  }

  async getAllBids(): Promise<Bid[]> {
    try {
      // Retrieve all bids from the Bid repository
      return await this.bidRepository.find({
        where: { status: 'Active' },
        relations: ['user'],
        order: {
          created_at: 'DESC', // Optionally, order by creation date
        },
      });
    } catch (error) {
      throw new Error(`Error fetching all bids: ${error.message}`);
    }
  }

  // Method to set a bid's status to 'inactive'
  async deactivateBid(bidId: number): Promise<Bid> {
    const bid = await this.bidRepository.findOne({ where: { bid_id: bidId } });

    if (!bid) {
      throw new Error(`Bid with ID ${bidId} not found.`);
    }

    // Change status to 'inactive'
    bid.status = STATUS.INACTIVE;
    return this.bidRepository.save(bid); // Save the updated bid back to the database
  }

  // Method to update the bid (edit the existing bid)
  async editBid(bidId: number, updateBidDto: UpdateBidDto): Promise<Bid> {
    const bid = await this.bidRepository.findOne({ where: { bid_id: bidId } });

    if (!bid) {
      throw new Error(`Bid with ID ${bidId} not found.`);
    }
    if (bid.status === 'inActive') {
      throw new HttpException(
        `Bid with ID ${bidId} is inactive and cannot be updated.`,
        HttpStatus.FORBIDDEN, // 403: Operation not allowed
      );
    }

    // Update the bid properties based on the provided data
    bid.title = updateBidDto.title || bid.title; // Only update if new value is provided
    bid.description = updateBidDto.description || bid.description;
    bid.price = updateBidDto.price || bid.price;
    bid.status = updateBidDto.status || bid.status; // Optionally update status


    // Save the updated bid
    return this.bidRepository.save(bid);
  }

  // Get a bid with its responses
  async getBidWithResponses(bidId: number): Promise<Bid> {
    const bid = await this.bidRepository.findOne({
      where: { bid_id: bidId },
      relations: ['user', 'responses', 'responses.manufacturer'],
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    }

    return bid;
  }

  // Create a bid response (manufacturer responding to an exporter's bid)
  async createBidResponse(
    manufacturerId: number,
    createBidResponseDto: CreateBidResponseDto,
  ): Promise<BidResponse> {
    const { bid_id, price, message, machineId, deadline } = createBidResponseDto;

    // Find the bid
    const bid = await this.bidRepository.findOne({
      where: { bid_id },
    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bid_id} not found.`);
    }

    // Find the manufacturer
    const manufacturer = await this.userRepository.findOne({
      where: { user_id: manufacturerId },
    });

    if (!manufacturer) {
      throw new NotFoundException(`User with ID ${manufacturerId} not found.`);
    }

    // Check if the manufacturer has already responded to this bid
    const existingResponse = await this.bidResponseRepository.findOne({
      where: {
        bid_id,
        manufacturer_id: manufacturerId,
      },
    });

    if (existingResponse) {
      throw new HttpException(
        'You have already responded to this bid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create the bid response
    const bidResponse = new BidResponse();
    bidResponse.bid = bid;
    bidResponse.bid_id = bid_id;
    bidResponse.manufacturer = manufacturer;
    bidResponse.manufacturer_id = manufacturerId;
    bidResponse.price = price;
    bidResponse.message = message;
    bidResponse.machineId = machineId;
    bidResponse.deadline = deadline;
    bidResponse.status = STATUS.PENDING;

    return this.bidResponseRepository.save(bidResponse);
  }

  // Get all responses for a bid
  async getBidResponses(bidId: number): Promise<BidResponse[]> {
    const responses = await this.bidResponseRepository.find({
      where: { bid_id: bidId },
      relations: ['manufacturer'],
      order: {
        created_at: 'DESC',
      },
    });

    return responses;
  }

  // Get all responses by a manufacturer
  async getManufacturerResponses(manufacturerId: number): Promise<BidResponse[]> {
    const responses = await this.bidResponseRepository.find({
      where: { manufacturer_id: manufacturerId },
      relations: ['bid', 'bid.user'],
      order: {
        created_at: 'DESC',
      },
    });

    return responses;
  }

  // Update a bid response
  async updateBidResponse(
    responseId: number,
    manufacturerId: number,
    updateBidResponseDto: UpdateBidResponseDto,
  ): Promise<BidResponse> {
    const response = await this.bidResponseRepository.findOne({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException(`Bid response with ID ${responseId} not found.`);
    }

    // Only the manufacturer who created the response can update it
    if (response.manufacturer_id !== manufacturerId) {
      throw new HttpException(
        'You are not authorized to update this response.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update the response
    if (updateBidResponseDto.price) {
      response.price = updateBidResponseDto.price;
    }

    if (updateBidResponseDto.message) {
      response.message = updateBidResponseDto.message;
    }

    return this.bidResponseRepository.save(response);
  }

  // Accept a bid response (by the exporter)
  async acceptBidResponse(responseId: number, exporterId: number): Promise<BidResponse> {
    const response = await this.bidResponseRepository.findOne({
      where: { id: responseId },
      relations: ['bid', 'bid.user', 'manufacturer'],
    });

    if (!response) {
      throw new NotFoundException(`Bid response with ID ${responseId} not found.`);
    }

    // Only the exporter who created the original bid can accept a response
    if (response.bid.user.user_id !== exporterId) {
      throw new HttpException(
        'You are not authorized to accept this response.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update the response status
    response.status = STATUS.ACCEPTED;

    // Update the original bid status
    const bid = response.bid;
    bid.status = STATUS.ACCEPTED;
    await this.bidRepository.save(bid);

    // Reject all other responses for this bid
    await this.bidResponseRepository.update(
      { bid_id: response.bid_id, id: Not(responseId) },
      { status: STATUS.REJECTED },
    );

    // Automatically create an order when a bid response is accepted
    // Use the deadline provided by the manufacturer, or default to 30 days if not provided
    const deadline = response.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.orderService.createOrder({
      bidId: response.bid_id,
      exporterId: exporterId,
      manufacturerId: response.manufacturer_id,
      machineId: response.machineId,
      status: STATUS.ACTIVE,
      deadline: deadline
    });

    return this.bidResponseRepository.save(response);
  }

  // Reject a bid response (by the exporter)
  async rejectBidResponse(responseId: number, exporterId: number): Promise<BidResponse> {
    const response = await this.bidResponseRepository.findOne({
      where: { id: responseId },
      relations: ['bid', 'bid.user'],
    });

    if (!response) {
      throw new NotFoundException(`Bid response with ID ${responseId} not found.`);
    }

    // Only the exporter who created the original bid can reject a response
    if (response.bid.user.user_id !== exporterId) {
      throw new HttpException(
        'You are not authorized to reject this response.',
        HttpStatus.FORBIDDEN,
      );
    }

    // Update the response status
    response.status = STATUS.REJECTED;

    return this.bidResponseRepository.save(response);
  }
}
