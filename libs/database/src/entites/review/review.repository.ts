import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Review } from './review.entity';
import { ReviewStatsDto } from './dto/review-stats.dto';

@Injectable()
export class ReviewRepository extends EntityRepository<Review> {
  async findById(id: number): Promise<Review | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async existsByProductAndReviewer(params: {
    productPostId: number;
    reviewerId: number;
  }): Promise<boolean> {
    const count = await this.count({
      productPostId: params.productPostId,
      reviewerId: params.reviewerId,
      isDeleted: false,
    });
    return count > 0;
  }

  async persist(review: Review): Promise<void> {
    await this.em.persist(review);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(review: Review): Promise<void> {
    await this.em.persistAndFlush(review);
  }

  async getReviewStatsByRevieweeId(
    revieweeId: number,
  ): Promise<ReviewStatsDto> {
    const knex = this.em.getKnex();

    const result = await knex('review')
      .select([
        knex.avg('rating').as('averageRating'),
        knex.count('id').as('totalReviews'),
      ])
      .where('reviewee_id', revieweeId)
      .where('is_deleted', false)
      .first();

    const averageRating = result?.averageRating
      ? parseFloat(result.averageRating as string)
      : null;
    const totalReviews = result?.totalReviews
      ? parseInt(result.totalReviews as string, 10)
      : 0;

    return ReviewStatsDto.of(averageRating, totalReviews);
  }

  /**
   * 특정 상품 목록에 대해 특정 유저가 작성한 리뷰를 조회합니다.
   *
   * @param productPostIds 상품 게시글 ID 목록
   * @param reviewerId 리뷰 작성자 ID
   * @returns 리뷰 목록
   */
  async findByProductIdsAndReviewerId(
    productPostIds: number[],
    reviewerId: number,
  ): Promise<Review[]> {
    if (productPostIds.length === 0) {
      return [];
    }

    return this.find({
      productPostId: { $in: productPostIds },
      reviewerId,
      isDeleted: false,
    });
  }

  /**
   * 특정 사용자가 작성한 모든 리뷰를 소프트 딜리트 처리합니다.
   * @param reviewerId 리뷰 작성자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByReviewerId(reviewerId: number): Promise<number> {
    return this.nativeUpdate(
      { reviewerId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
