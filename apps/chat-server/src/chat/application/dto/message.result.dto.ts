import { ConversationMessage } from '@app/database';
import { ConversationMessageType } from '@app/database/common/enums';

export class MessageResultDto {
  id: number;

  conversationId: number;

  senderId: number;

  content?: string;

  messageNumber: number;

  type: ConversationMessageType;

  createdAt: Date;

  constructor(message: ConversationMessage) {
    this.id = message.getId();
    this.conversationId = message.getConversationId();
    this.senderId = message.getSenderId();
    this.content = message.getContent();
    this.messageNumber = message.getMessageNumber();
    this.type = message.getType();
    this.createdAt = message.createdAt;
  }

  static from(message: ConversationMessage): MessageResultDto {
    return new MessageResultDto(message);
  }
}
