import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { LikeRepository } from './like.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => LikeRepository })
export class Like extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  productId!: number;

  @Property()
  userId!: number;

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
}
