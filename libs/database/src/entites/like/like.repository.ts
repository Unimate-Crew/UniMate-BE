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

  /**
   * 특정 유저가 좋아요한 상품 ID 목록을 조회합니다.
   * @param userId 유저 ID
   * @param productIds 조회할 상품 ID 목록
   * @returns 유저가 좋아요한 상품 ID Set
   */
  async findLikedProductIdsByUserIdAndProductIds(
    userId: number,
    productIds: number[],
  ): Promise<Set<number>> {
    if (productIds.length === 0) {
      return new Set();
    }

    const knex = this.em.getKnex();
    const result = await knex
      .select('product_id')
      .from('like')
      .where('user_id', userId)
      .whereIn('product_id', productIds);

    return new Set(result.map((row) => row.product_id));
  }

  /**
   * 특정 상품을 찜한 유저 ID 목록을 조회합니다.
   * @param productId 상품 ID
   * @returns 상품을 찜한 유저 ID 목록
   */
  async findUserIdsByProductId(productId: number): Promise<number[]> {
    const likes = await this.find({ productId }, { fields: ['userId'] });
    return likes.map((like) => like.userId);
  }
}
