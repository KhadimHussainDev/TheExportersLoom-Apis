import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Bid } from '../bid/entities/bid.entity';
import { MODULE_TO_MACHINE_MAP, ROLES, STATUS } from '../common';
import { Machine } from '../machines/entities/machine.entity';
import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Reviews) private reviewRepository: Repository<Reviews>,
    @InjectRepository(Machine) private machineRepository: Repository<Machine>,
    @InjectRepository(Bid) private bidRepository: Repository<Bid>,
  ) { }

  async getRecommendedManufacturers(exporterId: number, bidId: number) {
    // Step 1: Get bid details
    const bid = await this.bidRepository.findOne({ where: { bid_id: bidId } });
    if (!bid) {
      throw new Error('Bid not found');
    }

    // Step 2: Map module_type to machine_type
    const machineType = MODULE_TO_MACHINE_MAP[bid.module_type] || bid.module_type;

    // Step 3: Fetch manufacturers matching the machine type
    const matchingManufacturers = await this.machineRepository
      .createQueryBuilder('m')
      .leftJoin('m.machine_owner', 'u')
      .where('m.machine_type = :machineType', { machineType })
      .andWhere('u.userType = :type', { type: ROLES.MANUFACTURER })
      .andWhere('m.availability_status = :status', { status: 'true' })
      .select(['u.user_id AS userId', 'u.username'])
      .distinctOn(['u.user_id'])
      .getRawMany();

    if (matchingManufacturers.length === 0) {
      return []; // No matching manufacturers found
    }

    const manufacturerIds = matchingManufacturers.map((m) => m.userid);

    // Step 4: Get past collaboration manufacturers
    let pastManufacturerIds: number[] = [];
    if (manufacturerIds.length > 0) {
      const pastManufacturers = await this.orderRepository
        .createQueryBuilder('o')
        .select('o.manufacturerId')
        .where('o.exporterId = :exporterId', { exporterId })
        .andWhere('o.status = :status', { status: STATUS.COMPLETED })
        .andWhere('o.manufacturerId IN (:...manufacturerIds)', {
          manufacturerIds: manufacturerIds.length ? manufacturerIds : [0], // Avoid empty IN ()
        })
        .getRawMany();

      pastManufacturerIds = pastManufacturers.map((o) => o.manufacturerId);
    } else {
      console.log('⚠️ No manufacturers found for filtering past experience.');
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

    // Step 6: Combine and prioritize recommendations
    const recommendations = matchingManufacturers
      .map((manufacturer) => {
        const ratingData = manufacturerRatings.find(
          (r) => Number(r.manufacturerid) === Number(manufacturer.userid), // ✅ Convert both to numbers
        );

        return {
          ...manufacturer,
          avgRating: ratingData ? parseFloat(ratingData.avgrating) : 0, // ✅ Ensure correct parsing
          totalReviews: ratingData ? parseInt(ratingData.totalreviews, 10) : 0, // ✅ Ensure correct parsing
          hasWorkedBefore: pastManufacturerIds.includes(
            Number(manufacturer.userid),
          )
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
      .slice(0, 10);

    // Step 7: Get detailed manufacturer information
    const recommendedIds = recommendations.map(r => Number(r.userid));
    const manufacturerDetails = await this.userRepository.find({
      where: { user_id: In(recommendedIds) },
      relations: ['profile'],
      select: {
        user_id: true,
        username: true,
        picture: true,
        profile: {
          address: true,
          company_name: true,
          bio: true,
          profile_picture: true,
          rating: true
        }
      }
    });

    // Combine recommendations with details and add estimated data
    const enrichedRecommendations = recommendations.map(recommendation => {
      const details = manufacturerDetails.find(d => d.user_id === Number(recommendation.userid));

      // Calculate distance (placeholder - you might want to implement actual distance calculation)
      const distance = Math.floor(Math.random() * 20) + 1; // Random distance between 1-20 km

      return {
        userid: Number(recommendation.userid),
        u_username: recommendation.username,
        avgRating: recommendation.avgRating,
        totalReviews: recommendation.totalReviews,
        hasWorkedBefore: recommendation.hasWorkedBefore,
        // Add manufacturer details
        profileImage: details?.profile?.profile_picture || details?.picture || null,
        address: details?.profile?.address || '',
        city: details?.profile?.company_name || '', // Using company_name as location
        specialization: details?.profile?.bio || '', // Using bio for specialization
        experienceYears: Math.floor(Math.random() * 15) + 1, // Random experience 1-15 years since we don't have this data
        // Add estimated data
        distance,
        estimatedDays: Math.floor(Math.random() * 10) + 3, // Random days between 3-12
        estimatedPrice: parseFloat(bid.price.toString()) * (0.8 + Math.random() * 0.4) // Random price ±20% of bid price
      };
    });

    return enrichedRecommendations;
  }
}
