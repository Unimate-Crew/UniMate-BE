import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConversationRepository } from '@app/database/entites/conversation/conversation.repository';
import { ConversationParticipantRepository } from '@app/database/entites/conversation-participant/conversation-participant.repository';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { Conversation } from '@app/database/entites/conversation/conversation.entity';
import { ConversationParticipant } from '@app/database/entites/conversation-participant/conversation-participant.entity';
import {
  TradeStatus,
  ConversationParticipantStatus,
} from '@app/database/common/enums';
import { Slice, PageRequest } from '@app/common';
import { CreateConversationResultDto } from './dto/create-conversation-result.dto';
import { GetConversationsResultDto } from './dto/get-conversations-result.dto';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationParticipantRepository: ConversationParticipantRepository,
    private readonly productPostRepository: ProductPostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createConversation(params: {
    productPostId: number;
    userId: number;
  }): Promise<CreateConversationResultDto> {
    const { productPostId, userId } = params;

    const productPost =
      await this.productPostRepository.findById(productPostId);

    if (!productPost) {
      throw new NotFoundException('상품 게시글을 찾을 수 없습니다.');
    }

    if (productPost.getIsHidden()) {
      throw new BadRequestException('숨겨진 게시글입니다.');
    }

    if (productPost.getTradeStatus() !== TradeStatus.FOR_SALE) {
      throw new BadRequestException('판매 중인 상품만 채팅할 수 있습니다.');
    }

    const seller = await this.userRepository.findById(productPost.getUserId());

    if (!seller || seller.isUserDeleted()) {
      throw new BadRequestException('탈퇴한 판매자의 게시글입니다.');
    }

    if (productPost.isOwner(userId)) {
      throw new BadRequestException('본인의 게시글에는 채팅할 수 없습니다.');
    }

    const existingConversation = await this.findExistingConversation({
      productPostId,
      userId,
    });

    if (existingConversation) {
      return CreateConversationResultDto.from(existingConversation);
    }

    const conversation = await this.conversationRepository
      .getEntityManager()
      .transactional(async (em) => {
        const newConversation = this.conversationRepository.create({
          productPostId,
        });

        em.persist(newConversation);
        await em.flush();

        const participants = [
          this.conversationParticipantRepository.create({
            conversationId: newConversation.getId(),
            userId,
            status: ConversationParticipantStatus.JOIN,
          }),
          this.conversationParticipantRepository.create({
            conversationId: newConversation.getId(),
            userId: productPost.getUserId(),
            status: ConversationParticipantStatus.JOIN,
          }),
        ];

        em.persist(participants);
        await em.flush();

        return newConversation;
      });

    return CreateConversationResultDto.from(conversation);
  }

  async getConversations(params: {
    userId: number;
    pageRequest: PageRequest;
    productPostId?: number;
  }): Promise<Slice<GetConversationsResultDto>> {
    const { userId, pageRequest, productPostId } = params;

    const rawSlice =
      await this.conversationParticipantRepository.findConversationsByUserId({
        userId,
        productPostId,
        pageRequest,
      });

    const resultDtos = rawSlice.contents.map((row) => {
      const unreadCount = row.lastMessageNumber - row.lastReadMessageNumber;

      return GetConversationsResultDto.of({
        conversationId: row.conversationId,
        productPostId: row.productPostId,
        productTitle: row.productTitle || null,
        productThumbnailKey: row.productThumbnailKey || null,
        otherUserId: row.otherUserId,
        otherUserNickname: row.otherUserNickname || null,
        otherUserProfileImageKey: row.otherUserProfileImageKey || null,
        lastMessageContent: row.lastMessageContent || null,
        lastMessageSenderId: row.lastMessageSenderId || null,
        lastSentAt: row.lastSentAt || null,
        unreadCount,
      });
    });

    return Slice.of(resultDtos, rawSlice.hasNext);
  }

  private async findExistingConversation(params: {
    productPostId: number;
    userId: number;
  }): Promise<Conversation> {
    const { productPostId, userId } = params;

    const conversations =
      await this.conversationRepository.findAllByProductPostId(productPostId);

    if (!conversations) {
      return null;
    }

    const participantInfos =
      await this.conversationParticipantRepository.findByUserIdAndConversationIdsIn(
        {
          userId,
          conversationIds: conversations.map((conversation) =>
            conversation.getId(),
          ),
        },
      );

    const existingConversations = conversations.filter(
      (conversation: Conversation) =>
        participantInfos.some(
          (participantInfo: ConversationParticipant) =>
            participantInfo.getConversationId() === conversation.getId(),
        ),
    );

    if (existingConversations.length === 0) {
      return null;
    }

    return existingConversations[0];
  }
}
