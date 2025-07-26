import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Like } from './like.entity';

@Injectable()
export class LikeRepository extends EntityRepository<Like> {
  async findById(id: number): Promise<Like | null> {
    return this.findOne({ id });
  }

  async findByProductId(productId: number): Promise<Like[]> {
    return this.find({ productId });
  }

  async findByUserId(userId: number): Promise<Like[]> {
    return this.find({ userId });
  }

  async findByProductIdAndUserId(params: {
    productId: number;
    userId: number;
  }): Promise<Like | null> {
    return this.findOne({ productId: params.productId, userId: params.userId });
  }

  async countByProductId(productId: number): Promise<number> {
    return this.count({ productId });
  }

  async persist(like: Like): Promise<void> {
    await this.em.persist(like);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(like: Like): Promise<void> {
    await this.em.persistAndFlush(like);
  }

  async remove(like: Like): Promise<void> {
    await this.em.remove(like);
  }

  async removeAndFlush(like: Like): Promise<void> {
    await this.em.removeAndFlush(like);
  }

  async deleteByProductIdAndUserId(params: {
    productId: number;
    userId: number;
  }): Promise<number> {
    return this.nativeDelete({
      productId: params.productId,
      userId: params.userId,
    });
  }

  /**
   * 상품 ID 목록에 대한 좋아요 수를 그룹화하여 가져옵니다.
   * @param productIds 상품 ID 목록
   * @returns Map<상품ID, 좋아요수>
   */
  async countByProductIds(productIds: number[]): Promise<Map<number, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const knex = this.em.getKnex();
    const result = await knex
      .select('product_id')
      .count('* as count')
      .from('like')
      .whereIn('product_id', productIds)
      .groupBy('product_id');

    return new Map(result.map((row) => [row.product_id, Number(row.count)]));
  }
}
