import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MachineService } from 'machines/machine.service';
import { Repository } from 'typeorm';
import { UsersService } from 'users/users.service';
import { OrderService } from '../order/order.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { Reviews } from './entities/reviews.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewRepository: Repository<Reviews>,

    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    private readonly machineService: MachineService,
  ) { }

  async createReview(createReviewDto: CreateReviewDto): Promise<Reviews> {
    const { orderId, reviewGiverId, reviewTakerId, machineId, ...rest } = createReviewDto;

    // Validate all required entities exist
    const order = await this.orderService.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const reviewGiver = await this.userService.findOne(reviewGiverId);
    if (!reviewGiver) {
      throw new NotFoundException('Review giver not found');
    }

    const reviewTaker = await this.userService.findOne(reviewTakerId);
    if (!reviewTaker) {
      throw new NotFoundException('Review taker not found');
    }

    const machine = await this.machineService.findOne(machineId);
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    // Validate order status
    if (order.status === 'Pending') {
      throw new BadRequestException('Cannot create review: Order is still pending');
    }

    // Create and save the review
    const newReview = this.reviewRepository.create({
      order,
      reviewGiver,
      reviewTaker,
      machine,
      ...rest,
    });

    return await this.reviewRepository.save(newReview);
  }

  async getReviewById(reviewId: number): Promise<Reviews> {
    const review = await this.reviewRepository.findOne({
      where: { reviewId },
      relations: ['order', 'reviewGiver', 'reviewTaker', 'machine'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review;
  }

  async getAllReviews(): Promise<Reviews[]> {
    return await this.reviewRepository.find({
      relations: ['reviewTaker']
    });
  }

  async getAllReviewsOfUser(userId: number): Promise<any[]> {
    const reviews = await this.reviewRepository.find({
      where: {
        reviewTaker: { user_id: userId }
      },
      relations: ['reviewGiver', 'reviewGiver.profile', 'order']
    });

    // Map the reviews to include the necessary fields
    return reviews.map(review => ({
      reviewId: review.reviewId,
      orderId: review.order.orderId,
      rating: review.rating,
      reviewText: review.reviewText,
      reviewDate: review.reviewDate,
      reviewGiver: {
        name: review.reviewGiver.profile.name,
        picture: review.reviewGiver.profile.profile_picture
      }
    }));
  }

  async getUserAverageRating(userId: number): Promise<{ avgRating: number }> {
    const reviews = await this.reviewRepository.find({
      where: {
        reviewTaker: { user_id: userId }
      },
      select: ['rating']
    });

    if (reviews.length === 0) {
      return { avgRating: 0 }; // Return 0 if the user has no reviews
    }

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Round to 1 decimal place
    return { avgRating: Math.round(averageRating * 10) / 10 };
  }

  async updateReview(reviewId: number, updateReviewDto: Partial<Reviews>): Promise<Reviews> {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }
    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);

  }

  async deleteReview(reviewId: number): Promise<void> {
    const review = await this.getReviewById(reviewId);

    await this.reviewRepository.remove(review);
  }
}