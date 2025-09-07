export class ConversationListResultDto {
  conversationId: number;

  lastMessage?: string;

  lastSentAt?: Date;

  unreadCount: number;

  lastMessageNumber?: number;

  constructor(params: {
    conversationId: number;
    lastMessage?: string;
    lastSentAt?: Date;
    unreadCount: number;
    lastMessageNumber?: number;
  }) {
    this.conversationId = params.conversationId;
    this.lastMessage = params.lastMessage;
    this.lastSentAt = params.lastSentAt;
    this.unreadCount = params.unreadCount;
    this.lastMessageNumber = params.lastMessageNumber;
  }

  static of(params: {
    conversationId: number;
    lastMessage?: string;
    lastSentAt?: Date;
    unreadCount: number;
    lastMessageNumber?: number;
  }): ConversationListResultDto {
    return new ConversationListResultDto(params);
  }
}
