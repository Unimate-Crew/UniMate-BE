import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ReviewRepository,
  ProductPostRepository,
  ProductPost,
} from '@app/database';
import { ErrorCode } from '../../common/error-code';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly productPostRepository: ProductPostRepository,
  ) {}

  async createReview(params: {
    productPostId: number;
    reviewerId: number;
    rating: number;
    content?: string;
  }): Promise<number> {
    // 1. 평점 범위 검증
    if (params.rating < 1 || params.rating > 5) {
      throw new ConflictException({
        code: ErrorCode.REVIEW_INVALID_RATING,
        message: '평점은 1에서 5 사이여야 합니다.',
      });
    }

    // 2. 상품 게시글 조회 및 리뷰 대상자 유추(판매자)
    const productPost: ProductPost | null =
      await this.productPostRepository.findById(params.productPostId);
    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    // 2-1. 거래완료 상태 검증
    if (!productPost.isCompleted()) {
      throw new ConflictException({
        code: ErrorCode.REVIEW_NOT_ALLOWED_TRADE_NOT_COMPLETED,
        message: '거래가 완료된 상품에만 리뷰를 작성할 수 있습니다.',
      });
    }

    const revieweeId: number = productPost.getUserId();

    // 3. 자기 자신에게 리뷰 금지
    if (params.reviewerId === revieweeId) {
      throw new ConflictException({
        code: ErrorCode.REVIEW_SAME_USER,
        message: '본인에게 리뷰를 남길 수 없습니다.',
      });
    }

    // 4. 동일 상품/리뷰어 중복 리뷰 방지
    const exists: boolean =
      await this.reviewRepository.existsByProductAndReviewer({
        productPostId: params.productPostId,
        reviewerId: params.reviewerId,
      });

    if (exists) {
      throw new ConflictException({
        code: ErrorCode.REVIEW_ALREADY_EXISTS,
        message: '이미 해당 상품에 대한 리뷰를 작성했습니다.',
      });
    }

    const review = this.reviewRepository.create({
      productPostId: params.productPostId,
      reviewerId: params.reviewerId,
      revieweeId,
      rating: params.rating,
      content: params.content,
    });

    await this.reviewRepository.persistAndFlush(review);
    return review.getId();
  }
}
