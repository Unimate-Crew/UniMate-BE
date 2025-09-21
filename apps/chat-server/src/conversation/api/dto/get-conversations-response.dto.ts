import { ApiProperty } from '@nestjs/swagger';
import { Slice } from '@app/common';
import { ConversationSummaryDto } from './conversation-summary.dto';
import { GetConversationsResultDto } from '../../application/dto/get-conversations-result.dto';

export class GetConversationsResponseDto {
  @ApiProperty({
    description: '채팅방 리스트',
    type: [ConversationSummaryDto],
  })
  contents!: ConversationSummaryDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext!: boolean;

  private constructor(contents: ConversationSummaryDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static from(
    slice: Slice<GetConversationsResultDto>,
  ): GetConversationsResponseDto {
    const conversationSummaries = slice.contents.map((item) =>
      ConversationSummaryDto.of({
        conversationId: item.conversationId,
        productPostId: item.productPostId,
        productTitle: item.productTitle,
        productThumbnailKey: item.productThumbnailKey,
        otherUserId: item.otherUserId,
        otherUserNickname: item.otherUserNickname,
        otherUserProfileImageKey: item.otherUserProfileImageKey,
        lastMessageContent: item.lastMessageContent,
        lastMessageSenderId: item.lastMessageSenderId,
        lastSentAt: item.lastSentAt,
        unreadCount: item.unreadCount,
      }),
    );

    return new GetConversationsResponseDto(
      conversationSummaries,
      slice.hasNext,
    );
  }
}
