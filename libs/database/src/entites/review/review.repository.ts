import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Review } from './review.entity';

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
}
