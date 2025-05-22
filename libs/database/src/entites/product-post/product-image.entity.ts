import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductImageRepository } from './product-image.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => ProductImageRepository })
export class ProductImage extends BaseEntity {
  @PrimaryKey()
  private readonly id!: number;

  @Property()
  private productId!: number;

  @Property()
  private imageUrl!: string;

  @Property({ default: false })
  private isThumbnail: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getProductId(): number {
    return this.productId;
  }

  public setProductId(productId: number): void {
    this.productId = productId;
  }

  public getImageUrl(): string {
    return this.imageUrl;
  }

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
  }

  public getIsThumbnail(): boolean {
    return this.isThumbnail;
  }

  public setIsThumbnail(isThumbnail: boolean): void {
    this.isThumbnail = isThumbnail;
  }
}
