import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { Reviews } from './entities/reviews.entity';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) { }

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto): Promise<ApiResponseDto<Reviews>> {
    const review = await this.reviewService.createReview(createReviewDto);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Review created successfully',
      review
    );
  }

  @Get(':id')
  async getReviewById(@Param('id') reviewId: number): Promise<ApiResponseDto<Reviews>> {
    const review = await this.reviewService.getReviewById(reviewId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Review retrieved successfully',
      review
    );
  }

  @Get()
  async getAllReviews(): Promise<ApiResponseDto<Reviews[]>> {
    const reviews = await this.reviewService.getAllReviews();
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Reviews retrieved successfully',
      reviews
    );
  }

  @Put(':id')
  async updateReview(
    @Param('id') reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto
  ): Promise<ApiResponseDto<Reviews>> {
    const updatedReview = await this.reviewService.updateReview(reviewId, updateReviewDto);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Review updated successfully',
      updatedReview
    );
  }

  @Delete(':id')
  async deleteReview(@Param('id') reviewId: number): Promise<ApiResponseDto<any>> {
    await this.reviewService.deleteReview(reviewId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Review deleted successfully'
    );
  }
}
