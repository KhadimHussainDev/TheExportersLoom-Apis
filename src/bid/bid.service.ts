import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MODULE_TYPES, STATUS } from '../common';
import { CuttingModule } from '../modules/cutting module/cutting.module';
import { Cutting } from '../modules/cutting module/entities/cutting.entity';
import { FabricPricingModule } from '../modules/fabric-price module/entities/fabric-pricing-module.entity';
import { FabricQuantity } from '../modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { LogoPrinting } from '../modules/logo-printing module/entities/logo-printing.entity';
import { LogoPrintingModule } from '../modules/logo-printing module/logo-printing.module';
import { Packaging } from '../modules/packaging module/entities/packaging.entity';
import { Stitching } from '../modules/stitching module/entities/stitching.entity';
import { User } from '../users/entities/user.entity';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FabricPricingModule)
    private readonly fabricPricingRepository: Repository<FabricPricingModule>,
    @InjectRepository(FabricQuantity)
    private readonly fabricQuantityRepository: Repository<FabricQuantity>,
    @InjectRepository(Cutting)
    private readonly cuttingRepository: Repository<Cutting>,
    @InjectRepository(LogoPrinting)
    private readonly logoPrintingRepository: Repository<LogoPrinting>,
    @InjectRepository(Packaging)
    private readonly packagingRepository: Repository<Packaging>,
    @InjectRepository(Stitching)
    private readonly stitchingRepository: Repository<Stitching>
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
    module_type: typeof MODULE_TYPES[keyof typeof MODULE_TYPES], // Using MODULE_TYPES constant from constants.ts
  ): Promise<Bid> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Validate and fetch the appropriate module based on the module_type
    let moduleEntity: FabricPricingModule | FabricQuantity | CuttingModule | LogoPrintingModule | Packaging | Stitching;
    if (module_type === MODULE_TYPES.FABRIC_PRICING) {
      moduleEntity = await this.fabricPricingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.FABRIC_PRICING} with ID ${moduleId} not found.`);
      }
    } else if (module_type === MODULE_TYPES.FABRIC_QUANTITY) {
      moduleEntity = await this.fabricQuantityRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.FABRIC_QUANTITY} with ID ${moduleId} not found.`);
      }
    } else if (module_type === MODULE_TYPES.CUTTING) {
      moduleEntity = await this.cuttingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.CUTTING} with ID ${moduleId} not found.`);
      }
    } else if (module_type === MODULE_TYPES.LOGO_PRINTING) {
      moduleEntity = await this.logoPrintingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.LOGO_PRINTING} with ID ${moduleId} not found.`);
      }
    } else if (module_type === MODULE_TYPES.PACKAGING) {
      moduleEntity = await this.packagingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.PACKAGING} with ID ${moduleId} not found.`);
      }
    } else if (module_type === MODULE_TYPES.STITCHING) {
      moduleEntity = await this.stitchingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`${MODULE_TYPES.STITCHING} with ID ${moduleId} not found.`);
      }
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
    bid.module_id = moduleId; // Store the moduleId in the Bid
    bid.module_type = module_type; // Store the module_type in the Bid

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
}
