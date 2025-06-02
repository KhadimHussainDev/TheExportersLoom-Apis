import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';

import { Machine } from '../machines/entities/machine.entity'; 
import { STATUS } from '../common'; 
import { User } from '../users/entities/user.entity';
import { MODULE_TO_MACHINE_MAP } from '../common/constants'; 


import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';



@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Machine) private readonly machineRepo: Repository<Machine>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getRecommendedBids2(manufacturerId: number) {
    try {
      // Fetch the machines owned by the manufacturer
      const machines = await this.machineRepo.find({
        where: { machine_owner: { user_id: manufacturerId } }, // Use correct relation name
      });

      if (!machines || machines.length === 0) {
        console.log('No machines found for manufacturer:', manufacturerId);
        return []; // Return empty array instead of throwing an error
      }

      // Extract machine types from the manufacturer's machines
      const machineTypes = machines.map(machine => machine.machine_type);
      console.log('Manufacturer machine types:', machineTypes);

      if (!machineTypes.length) {
        console.log('No machine types found for manufacturer:', manufacturerId);
        return []; // Return empty array instead of throwing an error
      }

      // Create a machine-to-module mapping from MODULE_TO_MACHINE_MAP
      const machineToModuleMap = {};
      
      // Populate the reverse mapping
      Object.entries(MODULE_TO_MACHINE_MAP).forEach(([moduleType, machineType]) => {
        if (!machineToModuleMap[machineType]) {
          machineToModuleMap[machineType] = [];
        }
        machineToModuleMap[machineType].push(moduleType);
      });
      
      console.log('Machine to Module mapping:', machineToModuleMap);
      
      // Get all module types that correspond to the manufacturer's machine types
      const relevantModuleTypes = [];
      
      // For each machine type the manufacturer has, add the corresponding module types
      machineTypes.forEach(machineType => {
        const correspondingModuleTypes = machineToModuleMap[machineType] || [];
        relevantModuleTypes.push(...correspondingModuleTypes);
      });
      
      // Remove duplicates
      const uniqueModuleTypes = [...new Set(relevantModuleTypes)];
      console.log('Relevant module types for query:', uniqueModuleTypes);

      if (uniqueModuleTypes.length === 0) {
        console.log('No relevant module types found for manufacturer:', manufacturerId);
        return [];
      }

      // Fetch relevant bids where the module type matches the manufacturer's machine capabilities
      const relevantBids = await this.bidRepo
        .createQueryBuilder('bid')
        .innerJoinAndSelect('bid.user', 'user') // Join with user for additional info
        .where('bid.status = :status', { status: STATUS.ACTIVE })
        .andWhere('bid.module_type IN (:...moduleTypes)', { moduleTypes: uniqueModuleTypes })
        .andWhere('user.user_id != :manufacturerId', { manufacturerId }) // Exclude manufacturer's own bids
        .orderBy('bid.created_at', 'DESC')
        .take(10) // Limit results
        .getMany();

      console.log(`Found ${relevantBids.length} relevant bids for manufacturer ${manufacturerId}`);
      return relevantBids;
    } catch (error) {
      console.error('Error getting recommended bids:', error);
      return []; // Return empty array on error
    }
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Reviews) private readonly reviewRepo: Repository<Reviews>,
  ) {}

  async getRecommendedBids(manufacturerId: number) {
    // Step 1: Fetch all machines owned by the manufacturer
    const machines = await this.machineRepo.find({
      where: { machine_owner: { user_id: manufacturerId } },
      relations: ['machine_owner'],
    });

    if (!machines.length) {
      throw new NotFoundException('No machines found for this manufacturer');
    }

    // Extract unique machine types
    const machineTypes = [...new Set(machines.map(machine => machine.machine_type))];

    if (!machineTypes.length) {
      throw new NotFoundException('No machine types registered for this manufacturer');
    }

    // Step 2: Find all module types that match the machine types
    const matchedModuleTypes = Object.entries(MODULE_TO_MACHINE_MAP)
      .filter(([_, machine]) => machineTypes.includes(machine))
      .map(([module]) => module);

    if (!matchedModuleTypes.length) {
      throw new NotFoundException('No matching module types found for registered machines');
    }

    // Step 3: Fetch all active bids matching the module type
    const activeBids = await this.bidRepo
      .createQueryBuilder('bid')
      .where('bid.status = :status', { status: STATUS.ACTIVE })
      .andWhere('bid.user_id != :manufacturerId', { manufacturerId })
      .andWhere('bid.module_type IN (:...matchedModuleTypes)', { matchedModuleTypes })
      .leftJoinAndSelect('bid.user', 'user')
      .getMany();

    if (!activeBids.length) return [];

    // Extract unique exporter IDs from active bids
    const exporterIds = [...new Set(activeBids.map(bid => bid.user?.user_id).filter(id => id))];

    if (!exporterIds.length) {
      return activeBids.map(bid => ({
        ...bid,
        hasWorkedBefore: 0,
        avgRating: 0,
        totalReviews: 0,
      }));
    }

    // Step 4: Fetch past collaborations between manufacturer and exporters
    const pastCollaborations = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.exporterId', 'exporterId')
      .where('o.manufacturerId = :manufacturerId', { manufacturerId })
      .andWhere('o.status = :status', { status: STATUS.COMPLETED })
      .andWhere('o.exporterId IN (:...exporterIds)', { exporterIds })
      .getRawMany();

    const pastExporterIds = pastCollaborations.map(o => o.exporterId);

    // Step 5: Fetch exporter reviews (ratings and total reviews)
    const exporterRatings = await this.reviewRepo
      .createQueryBuilder('r')
      .select([
        'r.reviewTakerId AS "exporterId"',
        'AVG(r.rating) AS "avgRating"',
        'COUNT(r.reviewId) AS "totalReviews"',
      ])
      .where('r.reviewTakerId IN (:...exporterIds)', { exporterIds })
      .groupBy('r.reviewTakerId')
      .getRawMany();

    console.log('Exporter Ratings:', exporterRatings); // Debugging: Check fetched data

    // Map exporter ratings for quick lookup
    const ratingsMap = new Map(
      exporterRatings.map(r => [
        parseInt(r.exporterId, 10),
        { avgRating: parseFloat(r.avgRating) || 0, totalReviews: parseInt(r.totalReviews, 10) || 0 },
      ])
    );

    // Step 6: Enhance and sort bids
    const prioritizedBids = activeBids
      .map(bid => {
        const userId = bid.user?.user_id;
        return {
          ...bid,
          hasWorkedBefore: pastExporterIds.includes(userId) ? 1 : 0,
          avgRating: ratingsMap.get(userId)?.avgRating || 0,
          totalReviews: ratingsMap.get(userId)?.totalReviews || 0,
        };
      })
      .sort((a, b) => {
        if (b.hasWorkedBefore !== a.hasWorkedBefore) {
          return b.hasWorkedBefore - a.hasWorkedBefore;
        }
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        if (b.totalReviews !== a.totalReviews) {
          return b.totalReviews - a.totalReviews;
        }
        return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
      });

    return prioritizedBids;

  }
}
