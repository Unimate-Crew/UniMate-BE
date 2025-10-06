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
}
