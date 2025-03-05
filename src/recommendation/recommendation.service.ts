import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Bid } from '../bid/entities/bid.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Reviews) private reviewRepository: Repository<Reviews>,
    @InjectRepository(Machine) private machineRepository: Repository<Machine>,
    @InjectRepository(Bid) private bidRepository: Repository<Bid>,
  ) {}

  async getRecommendedManufacturers(exporterId: number, bidId: number) {
    // Step 1: Get bid details
    const bid = await this.bidRepository.findOne({ where: { bid_id: bidId } });
    console.log('Bid:', bid);
    if (!bid) {
      throw new Error('Bid not found');
    }

    // Step 2: Map module_type to machine_type
    const moduleToMachineMap = {
      CuttingModule: 'Cutting',
      StitchingModule: 'Stitching',
      LogoPrintingModule: 'Logo Printing',
      FabricPricingModule: 'Fabric Pricing',
      PackagingModule: 'Packaging',
    };

    const machineType = moduleToMachineMap[bid.module_type] || bid.module_type;
    console.log('Mapped Machine Type:', machineType);

    // Step 3: Fetch manufacturers matching the machine type
    const matchingManufacturers = await this.machineRepository
      .createQueryBuilder('m')
      .leftJoin('m.machine_owner', 'u')
      .where('m.machine_type = :machineType', { machineType })
      .andWhere('u.userType = :type', { type: 'manufacturer' })
      .select(['u.user_id AS userId', 'u.username'])
      .getRawMany();

    console.log('Matching Manufacturers:', matchingManufacturers);

    if (matchingManufacturers.length === 0) {
      return []; // No matching manufacturers found
    }

    const manufacturerIds = matchingManufacturers.map((m) => m.userId);

    // Step 4: Get past collaboration manufacturers
    let pastManufacturerIds: number[] = [];
    if (manufacturerIds.length > 0) {
      const pastManufacturers = await this.orderRepository
        .createQueryBuilder('o')
        .select('o.manufacturerId')
        .where('o.exporterId = :exporterId', { exporterId })
        .andWhere('o.status = :status', { status: 'Completed' })
        .andWhere('o.manufacturerId IN (:...manufacturerIds)', {
          manufacturerIds,
        })
        .getRawMany();

      console.log('Past Manufacturers:', pastManufacturers);
      pastManufacturerIds = pastManufacturers.map((o) => o.manufacturerId);
    } else {
      console.log('No manufacturers found for filtering past experience.');
    }

    // Step 5: Get manufacturer ratings
    let manufacturerRatings = [];
    if (manufacturerIds.length > 0) {
      manufacturerRatings = await this.reviewRepository
        .createQueryBuilder('r')
        .select([
          'r.reviewTakerId AS manufacturerId',
          'AVG(r.rating) AS avgRating',
          'COUNT(r.reviewId) AS totalReviews',
        ])
        .where('r.reviewTakerId IN (:...manufacturerIds)', { manufacturerIds })
        .groupBy('r.reviewTakerId')
        .getRawMany();
    }
    console.log('Manufacturer Ratings:', manufacturerRatings);

    // Step 6: Combine and prioritize recommendations
    return matchingManufacturers
      .map((manufacturer) => {
        const ratingData = manufacturerRatings.find(
          (r) => r.manufacturerId === manufacturer.userId,
        );

        return {
          ...manufacturer,
          avgRating: ratingData ? parseFloat(ratingData.avgRating) : 0,
          totalReviews: ratingData ? parseInt(ratingData.totalReviews, 10) : 0,
          hasWorkedBefore: pastManufacturerIds.includes(manufacturer.userId)
            ? 1
            : 0,
        };
      })
      .sort(
        (a, b) =>
          b.hasWorkedBefore - a.hasWorkedBefore ||
          b.avgRating - a.avgRating ||
          b.totalReviews - a.totalReviews,
      )
      .slice(0, 10); // Limit to top 10
  }
}
