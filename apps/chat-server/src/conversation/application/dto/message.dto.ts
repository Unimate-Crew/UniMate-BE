import { ConversationMessage, ConversationMessageType } from '@app/database';

export class MessageDto {
  id: number;

  senderId: number;

  content?: string;

  messageNumber: number;

  type: ConversationMessageType;

  createdAt: Date;

  public static from(message: ConversationMessage): MessageDto {
    const dto = new MessageDto();
    dto.id = message.getId();
    dto.senderId = message.getSenderId();
    dto.content = message.getContent();
    dto.messageNumber = message.getMessageNumber();
    dto.type = message.getType();
    dto.createdAt = message.createdAt;
    return dto;
  }
}
