import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { ErrorResponse } from '../../common/error-response';
import { CreateReviewRequestDto } from './dto/create-review.request.dto';
import { ReviewService } from '../application/review.service';
import { CreateReviewResponseDto } from './dto/create-review.response.dto';

@ApiTags('리뷰')
@Controller({ path: 'reviews' })
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '리뷰 생성 API' })
  @ApiResponse({
    status: 201,
    description: '리뷰 생성 성공',
    type: CreateReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청', type: ErrorResponse })
  @ApiResponse({ status: 401, description: '인증 실패', type: ErrorResponse })
  async createReview(
    @Body() dto: CreateReviewRequestDto,
    @CurrentUser() user: UserTokenInfo,
  ): Promise<CreateReviewResponseDto> {
    const reviewId = await this.reviewService.createReview({
      productPostId: dto.productPostId,
      reviewerId: user.userId,
      rating: dto.rating,
      content: dto.content,
    });

    return CreateReviewResponseDto.of(reviewId);
  }
}
