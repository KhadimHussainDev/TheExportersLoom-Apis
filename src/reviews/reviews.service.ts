import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly orderService: OrderService,
    private readonly userService: UsersService,
    private readonly machineService: MachineService,
  ) { }

  async createReview(createReviewDto: CreateReviewDto): Promise<Reviews> {
    const { orderId, reviewGiverId, reviewTakerId, machineId, ...rest } = createReviewDto;

    const order = await this.orderService.getOrderById(orderId);
    const reviewGiver = await this.userService.findOne(reviewGiverId);
    const reviewTaker = await this.userService.findOne(reviewTakerId);
    const machine = await this.machineService.findOne(machineId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (!reviewGiver) {
      throw new NotFoundException('Review giver not found');
    }
    if (!reviewTaker) {
      throw new NotFoundException('Review taker not found');
    }
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
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
    return await this.reviewRepository.findOne({
      where: { reviewId },
      relations: ['order', 'reviewGiver', 'reviewTaker', 'machine'],
    });
  }

  async getAllReviews(): Promise<Reviews[]> {
    return await this.reviewRepository.find({ relations: ['order', 'reviewGiver', 'reviewTaker', 'machine'] });
  }

  async updateReview(reviewId: number, updateReviewDto: Partial<Reviews>): Promise<Reviews> {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.reviewRepository.delete(reviewId);
  }
}