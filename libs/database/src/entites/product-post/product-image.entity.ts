import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductImageRepository } from './product-image.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => ProductImageRepository })
export class ProductImage extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  productId!: number;

  @Property()
  imageKey!: string;

  @Property({ default: false })
  isThumbnail: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getProductId(): number {
    return this.productId;
  }

  public setProductId(productId: number): void {
    this.productId = productId;
  }

  public getImageKey(): string {
    return this.imageKey;
  }

  public setImageKey(imageKey: string): void {
    this.imageKey = imageKey;
  }

  public getIsThumbnail(): boolean {
    return this.isThumbnail;
  }

  public setIsThumbnail(isThumbnail: boolean): void {
    this.isThumbnail = isThumbnail;
  }
}
