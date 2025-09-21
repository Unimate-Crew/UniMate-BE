import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConversationSummaryDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: 1,
  })
  conversationId!: number;

  @ApiProperty({
    description: '상품 게시글 ID',
    example: 123,
  })
  productPostId!: number;

  @ApiPropertyOptional({
    description: '상품 제목 (게시글이 삭제된 경우 null)',
    example: 'iPhone 15 Pro 판매합니다',
  })
  productTitle?: string | null;

  @ApiPropertyOptional({
    description: '상품 썸네일 이미지 URL (게시글이 삭제된 경우 null)',
    example: 'https://example.com/product-thumbnail.jpg',
  })
  productThumbnailUrl?: string | null;

  @ApiProperty({
    description: '채팅 상대방 사용자 ID',
    example: 456,
  })
  otherUserId!: number;

  @ApiPropertyOptional({
    description: '채팅 상대방 닉네임 (탈퇴한 경우 null)',
    example: '판매자123',
  })
  otherUserNickname?: string | null;

  @ApiPropertyOptional({
    description: '채팅 상대방 프로필 이미지 URL (탈퇴한 경우 null)',
    example: 'https://example.com/profile-image.jpg',
  })
  otherUserProfileImageUrl?: string | null;

  @ApiPropertyOptional({
    description: '마지막 메시지 내용',
    example: '안녕하세요, 구매 의사가 있습니다.',
  })
  lastMessageContent?: string | null;

  @ApiPropertyOptional({
    description: '마지막 메시지를 보낸 사용자 ID',
    example: 789,
  })
  lastMessageSenderId?: number | null;

  @ApiPropertyOptional({
    description: '마지막 메시지 전송 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastSentAt?: Date | null;

  @ApiProperty({
    description: '읽지 않은 메시지 개수',
    example: 3,
  })
  unreadCount!: number;

  private constructor(
    conversationId: number,
    productPostId: number,
    productTitle: string | null,
    productThumbnailUrl: string | null,
    otherUserId: number,
    otherUserNickname: string | null,
    otherUserProfileImageUrl: string | null,
    lastMessageContent: string | null,
    lastMessageSenderId: number | null,
    lastSentAt: Date | null,
    unreadCount: number,
  ) {
    this.conversationId = conversationId;
    this.productPostId = productPostId;
    this.productTitle = productTitle;
    this.productThumbnailUrl = productThumbnailUrl;
    this.otherUserId = otherUserId;
    this.otherUserNickname = otherUserNickname;
    this.otherUserProfileImageUrl = otherUserProfileImageUrl;
    this.lastMessageContent = lastMessageContent;
    this.lastMessageSenderId = lastMessageSenderId;
    this.lastSentAt = lastSentAt;
    this.unreadCount = unreadCount;
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
  }): ConversationSummaryDto {
    return new ConversationSummaryDto(
      params.conversationId,
      params.productPostId,
      params.productTitle,
      params.productThumbnailUrl,
      params.otherUserId,
      params.otherUserNickname,
      params.otherUserProfileImageUrl,
      params.lastMessageContent,
      params.lastMessageSenderId,
      params.lastSentAt,
      params.unreadCount,
    );
  }
}
