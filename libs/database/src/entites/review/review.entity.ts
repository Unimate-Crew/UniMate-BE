import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';
import { ReviewRepository } from './review.repository';

@Entity({ repository: () => ReviewRepository })
export class Review extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  productPostId!: number;

  @Property()
  reviewerId!: number;

  @Property()
  revieweeId!: number;

  @Property()
  rating!: number; // 1~5

  @Property({ nullable: true })
  content?: string;

  public getId(): number {
    return this.id;
  }

  public getContent(): string | undefined {
    return this.content;
  }

  public getProductPostId(): number {
    return this.productPostId;
  }

  public getReviewerId(): number {
    return this.reviewerId;
  }

  public getRevieweeId(): number {
    return this.revieweeId;
  }

  public getRating(): number {
    return this.rating;
  }
}
