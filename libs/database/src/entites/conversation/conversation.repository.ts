import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Conversation } from './conversation.entity';

@Injectable()
export class ConversationRepository extends EntityRepository<Conversation> {
  async findById(id: number): Promise<Conversation | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findAllByProductPostId(productPostId: number): Promise<Conversation[]> {
    return this.find({ productPostId, isDeleted: false });
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
