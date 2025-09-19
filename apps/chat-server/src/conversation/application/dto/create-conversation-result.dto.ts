import { Conversation } from '@app/database/entites/conversation/conversation.entity';

export class CreateConversationResultDto {
  id: number;

  productPostId: number;

  lastMessageNumber: number;

  lastSentAt?: Date;

  createdAt: Date;

  updatedAt: Date;

  private constructor(params: {
    id: number;
    productPostId: number;
    lastMessageNumber: number;
    lastSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.productPostId = params.productPostId;
    this.lastMessageNumber = params.lastMessageNumber;
    this.lastSentAt = params.lastSentAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static from(conversation: Conversation): CreateConversationResultDto {
    return new CreateConversationResultDto({
      id: conversation.getId(),
      productPostId: conversation.getProductPostId(),
      lastMessageNumber: conversation.getLastMessageNumber(),
      lastSentAt: conversation.getLastSentAt(),
      createdAt: conversation.getCreatedAt(),
      updatedAt: conversation.getUpdatedAt(),
    });
  }
}
