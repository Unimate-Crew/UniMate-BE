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

  /**
   * 특정 상품의 이미지들을 단일 쿼리로 소프트 딜리트 처리합니다.
   * @param productId 상품 게시글 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByProductId(productId: number): Promise<number> {
    return this.nativeUpdate(
      { productId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
