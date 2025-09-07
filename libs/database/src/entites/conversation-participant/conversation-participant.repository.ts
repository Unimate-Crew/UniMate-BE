import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { ConversationParticipant } from './conversation-participant.entity';

@Injectable()
export class ConversationParticipantRepository extends EntityRepository<ConversationParticipant> {
  async findById(id: number): Promise<ConversationParticipant | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByConversationIdAndUserId(
    conversationId: number,
    userId: number,
  ): Promise<ConversationParticipant | null> {
    return this.findOne({ conversationId, userId, isDeleted: false });
  }

  async findByConversationId(
    conversationId: number,
  ): Promise<ConversationParticipant[]> {
    return this.find({ conversationId, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<ConversationParticipant[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findActiveParticipants(
    conversationId: number,
  ): Promise<ConversationParticipant[]> {
    return this.find({
      conversationId,
      isDeleted: false,
      leftAt: null,
    });
  }

  async countParticipants(conversationId: number): Promise<number> {
    return this.count({ conversationId, isDeleted: false });
  }

  async persist(participant: ConversationParticipant): Promise<void> {
    await this.em.persist(participant);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(participant: ConversationParticipant): Promise<void> {
    await this.em.persistAndFlush(participant);
  }
}
