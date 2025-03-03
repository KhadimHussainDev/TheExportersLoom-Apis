import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Reviews } from '../reviews/entities/reviews.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Reviews) private reviewRepository: Repository<Reviews>,
  ) {}

  async getRecommendedManufacturers(exporterId: number) {
    // Step 1: Get the list of manufacturers with their average rating and review count
    const manufacturerRatings = await this.userRepository
      .createQueryBuilder('u') // Change alias from "user" to "u"
      .leftJoin(Reviews, 'r', 'u.user_id = r.reviewTakerId') // Use Review entity
      .select([
        'u.user_id AS user_id',
        'u.username AS username',
        'COALESCE(AVG(r.rating), 0) AS avg_rating',
        'COUNT(r.reviewId) AS total_reviews',
      ])
      .where('u.userType = :type', { type: 'manufacturer' })
      .groupBy('u.user_id')
      .getRawMany();

    // Step 2: Fetch manufacturers the exporter has previously worked with
    const previousOrders = await this.orderRepository
      .createQueryBuilder('order')
      .select('DISTINCT order.manufacturerId', 'manufacturerId')
      .where('order.exporterId = :exporterId', { exporterId })
      .getRawMany();

    const previousManufacturerIds = previousOrders.map(
      (order) => order.manufacturerId,
    );

    // Step 3: Combine the results to prioritize known manufacturers
    return manufacturerRatings
      .map((manufacturer) => ({
        ...manufacturer,
        has_ordered_before: previousManufacturerIds.includes(
          manufacturer.user_id,
        )
          ? 1
          : 0,
      }))
      .sort(
        (a, b) =>
          b.has_ordered_before - a.has_ordered_before ||
          b.avg_rating - a.avg_rating ||
          b.total_reviews - a.total_reviews,
      )
      .slice(0, 10);
  }
}
