import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { FabricPricingModule } from '../modules/fabric-price module/entities/fabric-pricing-module.entity'; 
import { FabricQuantity } from '../modules/fabric-quantity-module/entities/fabric-quantity.entity';
import { User } from '../users/entities/user.entity';

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
  ) {}

  async createBid(
    userId: number,
    moduleId: number,
    title: string,
    description: string,
    price: number,
    status: string,
    module_type: 'FabricPricingModule' | 'FabricQuantity', // Restrict module_type to valid types
  ): Promise<Bid> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Validate and fetch the appropriate module based on the module_type
    let moduleEntity: FabricPricingModule | FabricQuantity;
    if (module_type === 'FabricPricingModule') {
      moduleEntity = await this.fabricPricingRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`FabricPricingModule with ID ${moduleId} not found.`);
      }
    } else if (module_type === 'FabricQuantity') {
      moduleEntity = await this.fabricQuantityRepository.findOne({
        where: { id: moduleId },
      });
      if (!moduleEntity) {
        throw new Error(`FabricQuantityModule with ID ${moduleId} not found.`);
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
}
