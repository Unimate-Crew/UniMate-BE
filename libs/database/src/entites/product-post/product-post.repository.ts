import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { ProductPost } from './product-post.entity';
import { TradeStatus, ProductCategory } from '../../common/enums';

@Injectable()
export class ProductPostRepository extends EntityRepository<ProductPost> {
  async findById(id: number): Promise<ProductPost | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<ProductPost[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findByRegionId(regionId: string): Promise<ProductPost[]> {
    return this.find({ regionId, isDeleted: false });
  }

  async findByUniversityId(universityId: number): Promise<ProductPost[]> {
    return this.find({ universityId, isDeleted: false });
  }

  async findByTradeStatus(tradeStatus: TradeStatus): Promise<ProductPost[]> {
    return this.find({ tradeStatus, isDeleted: false });
  }

  async findByCategory(category: ProductCategory): Promise<ProductPost[]> {
    return this.find({ category, isDeleted: false });
  }

  async findAllActive(): Promise<ProductPost[]> {
    return this.find({ isDeleted: false });
  }

  async persist(productPost: ProductPost): Promise<void> {
    await this.em.persist(productPost);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(productPost: ProductPost): Promise<void> {
    await this.em.persistAndFlush(productPost);
  }
}
