import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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
import { ErrorCode } from '@app/common';
import {
  RoomOnlineCacheRepository,
  ParticipantCacheRepository,
  ConversationParticipantCache,
} from '@app/redis';
import { CreateConversationResultDto } from './dto/create-conversation-result.dto';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationParticipantRepository: ConversationParticipantRepository,
    private readonly productPostRepository: ProductPostRepository,
    private readonly userRepository: UserRepository,
    private readonly roomOnlineCacheRepository: RoomOnlineCacheRepository,
    private readonly participantCacheRepository: ParticipantCacheRepository,
  ) {}

  async createConversation(params: {
    productPostId: number;
    userId: number;
  }): Promise<CreateConversationResultDto> {
    const { productPostId, userId } = params;

    const productPost =
      await this.productPostRepository.findById(productPostId);

    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    if (productPost.getIsHidden()) {
      throw new BadRequestException({
        code: ErrorCode.PRODUCT_POST_HIDDEN,
        message: '숨겨진 게시글입니다.',
      });
    }

    if (productPost.getTradeStatus() !== TradeStatus.FOR_SALE) {
      throw new BadRequestException({
        code: ErrorCode.PRODUCT_POST_NOT_FOR_SALE,
        message: '판매 중인 상품만 채팅할 수 있습니다.',
      });
    }

    const seller = await this.userRepository.findById(productPost.getUserId());

    if (!seller || seller.isUserDeleted()) {
      throw new BadRequestException({
        code: ErrorCode.CONVERSATION_SELLER_DELETED,
        message: '탈퇴한 판매자의 게시글입니다.',
      });
    }

    if (productPost.isOwner(userId)) {
      throw new BadRequestException({
        code: ErrorCode.CONVERSATION_OWN_POST_NOT_ALLOWED,
        message: '본인의 게시글에는 채팅할 수 없습니다.',
      });
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

  async muteConversation(params: {
    userId: number;
    conversationId: number;
  }): Promise<void> {
    const { userId, conversationId } = params;

    const conversation: Conversation | null =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: ErrorCode.CONVERSATION_NOT_FOUND,
        message: '채팅방을 찾을 수 없습니다.',
      });
    }

    const participant: ConversationParticipant | null =
      await this.conversationParticipantRepository.findByConversationIdAndUserId(
        {
          conversationId,
          userId,
        },
      );

    if (!participant) {
      throw new ForbiddenException({
        code: ErrorCode.PARTICIPANT_NOT_FOUND,
        message: '채팅방에 참가하지 않은 사용자입니다.',
      });
    }

    if (participant.isLeft()) {
      throw new ForbiddenException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    if (participant.isMuted()) {
      throw new ConflictException({
        code: ErrorCode.CONVERSATION_ALREADY_MUTED,
        message: '이미 알림이 꺼진 채팅방입니다.',
      });
    }

    participant.addStatus(ConversationParticipantStatus.MUTE);

    await this.conversationParticipantRepository.persistAndFlush(participant);
  }

  async unmuteConversation(params: {
    userId: number;
    conversationId: number;
  }): Promise<void> {
    const { userId, conversationId } = params;

    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: ErrorCode.CONVERSATION_NOT_FOUND,
        message: '채팅방을 찾을 수 없습니다.',
      });
    }

    const participant =
      await this.conversationParticipantRepository.findByConversationIdAndUserId(
        {
          conversationId,
          userId,
        },
      );

    if (!participant) {
      throw new ForbiddenException({
        code: ErrorCode.PARTICIPANT_NOT_FOUND,
        message: '채팅방에 참가하지 않은 사용자입니다.',
      });
    }

    if (participant.isLeft()) {
      throw new ForbiddenException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    if (!participant.isMuted()) {
      throw new ConflictException({
        code: ErrorCode.CONVERSATION_ALREADY_UNMUTED,
        message: '이미 알림이 켜진 채팅방입니다.',
      });
    }

    participant.removeStatus(ConversationParticipantStatus.MUTE);

    await this.conversationParticipantRepository.persistAndFlush(participant);
  }

  async leaveConversation(params: {
    userId: number;
    conversationId: number;
  }): Promise<void> {
    const { userId, conversationId } = params;

    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: ErrorCode.CONVERSATION_NOT_FOUND,
        message: '채팅방을 찾을 수 없습니다.',
      });
    }

    const participant =
      await this.conversationParticipantRepository.findByConversationIdAndUserId(
        {
          conversationId,
          userId,
        },
      );

    if (!participant) {
      throw new ForbiddenException({
        code: ErrorCode.PARTICIPANT_NOT_FOUND,
        message: '채팅방에 참가하지 않은 사용자입니다.',
      });
    }

    if (!participant.isJoined()) {
      throw new ForbiddenException({
        code: ErrorCode.PARTICIPANT_NOT_FOUND,
        message: '채팅방에 참가하지 않은 사용자입니다.',
      });
    }

    if (participant.isLeft()) {
      throw new ConflictException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    participant.leaveConversation();

    await this.conversationParticipantRepository
      .getEntityManager()
      .transactional(async (em) => {
        await em.persistAndFlush(participant);

        await this.roomOnlineCacheRepository.removeUserFromRoom(
          conversationId,
          userId,
        );

        const updatedParticipants =
          await this.conversationParticipantRepository.find({
            conversationId,
            isDeleted: false,
          });

        const cachedParticipants = updatedParticipants.map((p) => ({
          userId: p.getUserId(),
          lastReadMessageNumber: p.getLastReadMessageNumber(),
          status: p.getStatus(),
        }));

        const participantCaches = cachedParticipants.map((p) =>
          ConversationParticipantCache.from({
            userId: p.userId,
            lastReadMessageNumber: p.lastReadMessageNumber,
            status: p.status,
          }),
        );

        await this.participantCacheRepository.setParticipants(
          conversationId,
          participantCaches,
        );
      });
  }
}
