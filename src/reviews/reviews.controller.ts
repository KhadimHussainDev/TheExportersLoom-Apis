import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { Reviews } from './entities/reviews.entity';
import { UpdateReviewDto } from './dtos/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) { }

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return await this.reviewService.createReview(createReviewDto);
  }

  @Get(':id')
  async getReviewById(@Param('id') reviewId: number) {
    return await this.reviewService.getReviewById(reviewId);
  }

  @Get()
  async getAllReviews(): Promise<Reviews[]> {
    return await this.reviewService.getAllReviews();
  }

  @Put(':id')
  async updateReview(@Param('id') reviewId: number, @Body() updateReviewDto: UpdateReviewDto) {
    return await this.reviewService.updateReview(reviewId, updateReviewDto);
  }

  @Delete(':id')
  async deleteReview(@Param('id') reviewId: number): Promise<void> {
    return await this.reviewService.deleteReview(reviewId);
  }
}
