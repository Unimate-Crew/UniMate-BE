import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { ConversationMessage } from './conversation-message.entity';

@Injectable()
export class ConversationMessageRepository extends EntityRepository<ConversationMessage> {
  async findById(id: number): Promise<ConversationMessage | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByConversationId(
    conversationId: number,
    offset: number = 0,
    limit: number = 50,
  ): Promise<ConversationMessage[]> {
    return this.find(
      { conversationId, isDeleted: false },
      {
        orderBy: { messageNumber: 'ASC' },
        offset,
        limit,
      },
    );
  }

  async findByConversationIdAndMessageNumber(
    conversationId: number,
    messageNumber: number,
  ): Promise<ConversationMessage | null> {
    return this.findOne({ conversationId, messageNumber, isDeleted: false });
  }

  async findMessagesAfterNumber(
    conversationId: number,
    messageNumber: number,
    limit: number = 50,
  ): Promise<ConversationMessage[]> {
    return this.find(
      {
        conversationId,
        messageNumber: { $gt: messageNumber },
        isDeleted: false,
      },
      {
        orderBy: { messageNumber: 'ASC' },
        limit,
      },
    );
  }

  async findLatestMessage(
    conversationId: number,
  ): Promise<ConversationMessage | null> {
    return this.findOne(
      { conversationId, isDeleted: false },
      { orderBy: { messageNumber: 'DESC' } },
    );
  }

  async getNextMessageNumber(conversationId: number): Promise<number> {
    const latestMessage = await this.findLatestMessage(conversationId);
    return latestMessage ? latestMessage.getMessageNumber() + 1 : 1;
  }

  async countMessagesByConversation(conversationId: number): Promise<number> {
    return this.count({ conversationId, isDeleted: false });
  }

  async findMessagesBySender(senderId: number): Promise<ConversationMessage[]> {
    return this.find({ senderId, isDeleted: false });
  }

  async persist(message: ConversationMessage): Promise<void> {
    await this.em.persist(message);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(message: ConversationMessage): Promise<void> {
    await this.em.persistAndFlush(message);
  }
}
