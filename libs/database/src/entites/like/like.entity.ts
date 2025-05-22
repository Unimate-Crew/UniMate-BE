import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { LikeRepository } from './like.repository';

@Entity({ repository: () => LikeRepository })
export class Like {
  @PrimaryKey()
  private readonly id!: number;

  @Property()
  private productId!: number;

  @Property()
  private userId!: number;

  @Property()
  private createdAt: Date = new Date();

  public getId(): number {
    return this.id;
  }

  public getProductId(): number {
    return this.productId;
  }

  public setProductId(productId: number): void {
    this.productId = productId;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
