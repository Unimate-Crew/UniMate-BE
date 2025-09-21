export class GetConversationsResultDto {
  conversationId: number;

  productPostId: number;

  productTitle: string | null;

  productThumbnailUrl: string | null;

  otherUserId: number;

  otherUserNickname: string | null;

  otherUserProfileImageUrl: string | null;

  lastMessageContent: string | null;

  lastMessageSenderId: number | null;

  lastSentAt: Date | null;

  unreadCount: number;

  private constructor(params: {
    conversationId: number;
    productPostId: number;
    productTitle: string | null;
    productThumbnailUrl: string | null;
    otherUserId: number;
    otherUserNickname: string | null;
    otherUserProfileImageUrl: string | null;
    lastMessageContent: string | null;
    lastMessageSenderId: number | null;
    lastSentAt: Date | null;
    unreadCount: number;
  }) {
    this.conversationId = params.conversationId;
    this.productPostId = params.productPostId;
    this.productTitle = params.productTitle;
    this.productThumbnailUrl = params.productThumbnailUrl;
    this.otherUserId = params.otherUserId;
    this.otherUserNickname = params.otherUserNickname;
    this.otherUserProfileImageUrl = params.otherUserProfileImageUrl;
    this.lastMessageContent = params.lastMessageContent;
    this.lastMessageSenderId = params.lastMessageSenderId;
    this.lastSentAt = params.lastSentAt;
    this.unreadCount = params.unreadCount;
  }

  static of(params: {
    conversationId: number;
    productPostId: number;
    productTitle: string | null;
    productThumbnailUrl: string | null;
    otherUserId: number;
    otherUserNickname: string | null;
    otherUserProfileImageUrl: string | null;
    lastMessageContent: string | null;
    lastMessageSenderId: number | null;
    lastSentAt: Date | null;
    unreadCount: number;
  }): GetConversationsResultDto {
    return new GetConversationsResultDto(params);
  }
}
