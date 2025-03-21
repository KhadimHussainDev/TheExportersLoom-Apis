import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';
import { STATUS, MODULE_TO_MACHINE_MAP } from '../common/constants';

@Injectable()
export class RecommendBidsService {
  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Machine) private readonly machineRepo: Repository<Machine>,
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
