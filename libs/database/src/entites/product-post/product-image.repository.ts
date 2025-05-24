import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { ProductImage } from './product-image.entity';

@Injectable()
export class ProductImageRepository extends EntityRepository<ProductImage> {
  async findById(id: number): Promise<ProductImage | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByProductId(productId: number): Promise<ProductImage[]> {
    return this.find({ productId, isDeleted: false });
  }

  async findThumbnailByProductId(
    productId: number,
  ): Promise<ProductImage | null> {
    return this.findOne({ productId, isThumbnail: true, isDeleted: false });
  }

  async persist(productImage: ProductImage): Promise<void> {
    await this.em.persist(productImage);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(productImage: ProductImage): Promise<void> {
    await this.em.persistAndFlush(productImage);
  }
}
