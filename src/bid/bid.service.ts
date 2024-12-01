import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './entities/bid.entity';
import { FabricPricingModule } from '../modules/fabric-price module/entities/fabric-pricing-module.entity';
import { User } from '../users/entities/user.entity'; // Assuming the User entity exists

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FabricPricingModule)
    private readonly fabricPricingRepository: Repository<FabricPricingModule>,
  ) {}

  async createBid(
    userId: number,
    fabricPricingModuleId: number,
    title: string,
    description: string,
    price: number,
    status: string,
  ): Promise<Bid> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }
  
    // Find the fabric pricing module
    const fabricPricingModule = await this.fabricPricingRepository.findOne({
      where: { id: fabricPricingModuleId },
    });
    if (!fabricPricingModule) {
      throw new Error(`FabricPricingModule with ID ${fabricPricingModuleId} not found.`);
    }
  
    // Create a new Bid
    const bid = new Bid();
    bid.user = user;
    bid.fabricPricingModule = fabricPricingModule;  // Ensure this is correctly set
    bid.title = title;
    bid.description = description;
    bid.price = price;
    bid.status = status;  // Set the status (e.g., "Active", "Posted")
    console.log(`Saving bid with fabricPricingModuleId: ${fabricPricingModule.id} and userId: ${user.user_id}`);

    // Save the Bid
    return this.bidRepository.save(bid);
  }
  
}
