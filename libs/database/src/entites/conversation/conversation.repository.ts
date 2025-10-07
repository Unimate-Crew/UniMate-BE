import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Conversation } from './conversation.entity';

@Injectable()
export class ConversationRepository extends EntityRepository<Conversation> {
  async findById(id: number): Promise<Conversation | null> {
    return this.findOne({ id, isDeleted: false });
  }

  /**
   * 상품 게시글 기반으로 대화방을 조회합니다.
   *
   * @param productPostId 상품 게시글 ID
   * @returns 대화방 엔티티
   */
  async findByProductPostId(
    productPostId: number,
  ): Promise<Conversation | null> {
    return this.findOne({ productPostId, isDeleted: false });
  }

  async findAllByProductPostId(productPostId: number): Promise<Conversation[]> {
    return this.find({ productPostId, isDeleted: false });
  }

  /**
   * 대화방을 생성합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @returns 생성된 대화방 엔티티
   */
  create(params: { productPostId: number }): Conversation {
    const conversation = this.em.create(Conversation, {
      productPostId: params.productPostId,
    });
    return conversation;
  }

  async persist(conversation: Conversation): Promise<void> {
    await this.em.persist(conversation);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(conversation: Conversation): Promise<void> {
    await this.em.persistAndFlush(conversation);
  }

  /**
   * 상품 ID 목록에 대한 채팅방 수를 그룹화하여 가져옵니다.
   * @param productIds 상품 ID 목록
   * @returns Map<상품ID, 채팅방수>
   */
  async countByProductIds(productIds: number[]): Promise<Map<number, number>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const knex = this.em.getKnex();
    const result = await knex
      .select('product_post_id')
      .count('* as count')
      .from('conversation')
      .whereIn('product_post_id', productIds)
      .where('is_deleted', false)
      .groupBy('product_post_id');

    return new Map(
      result.map((row) => [row.product_post_id, Number(row.count)]),
    );
  }
}
