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
}
