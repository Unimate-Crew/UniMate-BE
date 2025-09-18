import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { ConversationMessage } from './conversation-message.entity';
import { ConversationMessageType } from '../../common/enums';

@Injectable()
export class ConversationMessageRepository extends EntityRepository<ConversationMessage> {
  async findById(id: number): Promise<ConversationMessage | null> {
    return this.findOne({ id, isDeleted: false });
  }

  /**
   * 대화방의 메시지 목록을 페이지네이션하여 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @param offset 오프셋
   * @param limit 제한 개수
   * @returns 메시지 목록
   */
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

  /**
   * 특정 메시지 번호의 메시지를 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @param messageNumber 메시지 번호
   * @returns 메시지 엔티티
   */
  async findByConversationIdAndMessageNumber(
    conversationId: number,
    messageNumber: number,
  ): Promise<ConversationMessage | null> {
    return this.findOne({ conversationId, messageNumber, isDeleted: false });
  }

  /**
   * 특정 메시지 번호 이후의 메시지들을 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @param messageNumber 기준 메시지 번호
   * @param limit 제한 개수
   * @returns 메시지 목록
   */
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

  /**
   * 대화방의 최신 메시지를 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @returns 최신 메시지 엔티티
   */
  async findLatestMessage(
    conversationId: number,
  ): Promise<ConversationMessage | null> {
    return this.findOne(
      { conversationId, isDeleted: false },
      { orderBy: { messageNumber: 'DESC' } },
    );
  }

  /**
   * 메시지를 생성합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.senderId 발송자 ID
   * @param params.content 메시지 내용
   * @param params.messageNumber 메시지 번호
   * @param params.type 메시지 타입
   * @returns 생성된 메시지 엔티티
   */
  create(params: {
    conversationId: number;
    senderId: number;
    content?: string;
    messageNumber: number;
    type?: ConversationMessageType;
  }): ConversationMessage {
    const message = this.em.create(ConversationMessage, {
      conversationId: params.conversationId,
      senderId: params.senderId,
      content: params.content,
      messageNumber: params.messageNumber,
      type: params.type,
    });
    return message;
  }

  /**
   * 다음 메시지 번호를 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @returns 다음 메시지 번호
   */
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
