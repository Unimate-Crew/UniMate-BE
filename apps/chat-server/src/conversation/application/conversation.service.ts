import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConversationRepository } from '@app/database/entites/conversation/conversation.repository';
import { ConversationParticipantRepository } from '@app/database/entites/conversation-participant/conversation-participant.repository';
import { ConversationMessageRepository } from '@app/database/entites/conversation-message/conversation-message.repository';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { TradeProgressRepository } from '@app/database/entites/trade-progress/trade-progress.repository';
import { Conversation } from '@app/database/entites/conversation/conversation.entity';
import { ConversationParticipant } from '@app/database/entites/conversation-participant/conversation-participant.entity';
import { TradeStatus } from '@app/database/common/enums';
import {
  Slice,
  PageRequest,
  ErrorCode,
  S3Service,
  PresignedUrlDto,
} from '@app/common';
import {
  RoomOnlineCacheRepository,
  ParticipantCacheRepository,
  ConversationParticipantCache,
} from '@app/redis';
import { CreateConversationResultDto } from './dto/create-conversation-result.dto';
import { GetConversationsResultDto } from './dto/get-conversations-result.dto';
import { GetMessagesResultDto } from './dto/get-messages-result.dto';
import { MessageDto } from './dto/message.dto';
import { CheckSendPermissionResultDto } from './dto/check-send-permission-result.dto';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly conversationParticipantRepository: ConversationParticipantRepository,
    private readonly conversationMessageRepository: ConversationMessageRepository,
    private readonly productPostRepository: ProductPostRepository,
    private readonly userRepository: UserRepository,
    private readonly roomOnlineCacheRepository: RoomOnlineCacheRepository,
    private readonly participantCacheRepository: ParticipantCacheRepository,
    private readonly tradeProgressRepository: TradeProgressRepository,
    private readonly s3Service: S3Service,
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
          }),
          this.conversationParticipantRepository.create({
            conversationId: newConversation.getId(),
            userId: productPost.getUserId(),
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

    const resultDtos = await Promise.all(
      rawSlice.contents.map(async (row) => {
        const unreadCount = row.lastMessageNumber - row.lastReadMessageNumber;

        const productThumbnailUrl = row.productThumbnailKey
          ? await this.s3Service.generateGetPresignedUrl(
              row.productThumbnailKey,
            )
          : null;

        const otherUserProfileImageUrl = row.otherUserProfileImageKey
          ? await this.s3Service.generateGetPresignedUrl(
              row.otherUserProfileImageKey,
            )
          : null;

        return GetConversationsResultDto.of({
          conversationId: row.conversationId,
          productPostId: row.productPostId,
          productTitle: row.productTitle || null,
          productThumbnailUrl,
          otherUserId: row.otherUserId,
          otherUserNickname: row.otherUserNickname || null,
          otherUserProfileImageUrl,
          lastMessageContent: row.lastMessageContent || null,
          lastMessageSenderId: row.lastMessageSenderId || null,
          lastSentAt: row.lastSentAt || null,
          unreadCount,
        });
      }),
    );

    return Slice.of(resultDtos, rawSlice.hasNext);
  }

  async getMessages(params: {
    userId: number;
    conversationId: number;
    size: number;
    lastMessageNumber?: number;
  }): Promise<GetMessagesResultDto> {
    const { userId, conversationId, size, lastMessageNumber } = params;

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

    if (
      conversation.getLastSentAt() &&
      participant.getLeftAt() &&
      conversation.getLastSentAt() > participant.getLeftAt()
    ) {
      throw new ForbiddenException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    // 채팅방의 모든 참여자 조회 (읽음 상태 계산용)
    const allParticipants = await this.conversationParticipantRepository.find({
      conversationId,
      isDeleted: false,
    });

    const messageSlice =
      await this.conversationMessageRepository.findByConversationIdAndLessThanMessageNumber(
        conversationId,
        lastMessageNumber,
        participant.getLeftAt(),
        size,
      );

    const messages = messageSlice.contents.slice().reverse();
    const messageDtos = messages.map((message) => MessageDto.from(message));

    // 읽음 상태 맵 생성 - 참여자의 마지막 읽은 메시지 번호별로 사용자 수 계산
    const readStatusMap: Record<string, number> = {};

    allParticipants.forEach((participant) => {
      const lastReadMessageNumber = participant.getLastReadMessageNumber() || 0;
      if (lastReadMessageNumber > 0) {
        const key = lastReadMessageNumber.toString();
        readStatusMap[key] = (readStatusMap[key] || 0) + 1;
      }
    });

    return GetMessagesResultDto.of({
      messages: messageDtos,
      hasNext: messageSlice.hasNext,
      nextCursor: messageSlice.nextCursor,
      readStatusMap,
    });
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

    if (participant.hasLeft()) {
      throw new ForbiddenException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    if (participant.getIsMuted()) {
      throw new ConflictException({
        code: ErrorCode.CONVERSATION_ALREADY_MUTED,
        message: '이미 알림이 꺼진 채팅방입니다.',
      });
    }

    participant.setIsMuted(true);

    await this.conversationParticipantRepository.persistAndFlush(participant);

    // 캐시 동기화
    await this.updateParticipantMutedCache(conversationId, userId, true);
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

    if (participant.hasLeft()) {
      throw new ForbiddenException({
        code: ErrorCode.CONVERSATION_PARTICIPANT_ALREADY_LEFT,
        message: '이미 나간 채팅방입니다.',
      });
    }

    if (!participant.getIsMuted()) {
      throw new ConflictException({
        code: ErrorCode.CONVERSATION_ALREADY_UNMUTED,
        message: '이미 알림이 켜진 채팅방입니다.',
      });
    }

    participant.setIsMuted(false);

    await this.conversationParticipantRepository.persistAndFlush(participant);

    // 캐시 동기화
    await this.updateParticipantMutedCache(conversationId, userId, false);
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

    if (!participant.isActive()) {
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

        // 모든 참가자가 나간 경우 캐시 삭제
        if (updatedParticipants.length === 0) {
          await this.participantCacheRepository.clearParticipants(
            conversationId,
          );
          return;
        }

        // 남은 참가자가 있는 경우 캐시 재생성
        const cachedParticipants = updatedParticipants.map((p) => ({
          userId: p.getUserId(),
          lastReadMessageNumber: p.getLastReadMessageNumber(),
          isBlockingOther: p.getIsBlockingOther(),
          isMuted: p.getIsMuted(),
        }));

        const participantCaches = cachedParticipants.map((p) =>
          ConversationParticipantCache.from({
            userId: p.userId,
            lastReadMessageNumber: p.lastReadMessageNumber,
            isBlockingOther: p.isBlockingOther,
            isMuted: p.isMuted,
          }),
        );

        await this.participantCacheRepository.setParticipants(
          conversationId,
          participantCaches,
        );
      });
  }

  async checkSendMessagePermission(params: {
    conversationId: number;
    userId: number;
  }): Promise<CheckSendPermissionResultDto> {
    const { conversationId, userId } = params;

    // 1. 채팅방 조회
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException({
        code: ErrorCode.CONVERSATION_NOT_FOUND,
        message: '채팅방을 찾을 수 없습니다.',
      });
    }

    // 2. 참여자 확인
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

    // 3. 상품 게시글 조회 (삭제된 것 포함)
    const productPost =
      await this.productPostRepository.findByIdIncludingDeleted(
        conversation.getProductPostId(),
      );

    // 4. 상품 게시글이 없는 경우 (hard delete) → 무조건 발송 불가
    if (!productPost) {
      return CheckSendPermissionResultDto.of(false);
    }

    // 5. 판매자 탈퇴 여부 확인
    const seller = await this.userRepository.findById(productPost.getUserId());

    // 탈퇴한 유저의 게시글 → 무조건 발송 불가
    if (!seller || seller.isUserDeleted()) {
      return CheckSendPermissionResultDto.of(false);
    }

    // 6. 판매자 여부 확인
    const isSeller = productPost.getUserId() === userId;

    // 7. TradeProgress 조회 (구매자 확인용)
    const tradeProgress =
      await this.tradeProgressRepository.findByProductPostId(
        conversation.getProductPostId(),
      );

    // 8. 현재 사용자가 구매자인지 확인
    const isBuyer = tradeProgress && tradeProgress.getBuyerId() === userId;

    // 9. 삭제(soft delete)/숨김/판매완료 상태 → 판매자 또는 구매자만 발송 가능
    const tradeStatus = productPost.getTradeStatus();
    if (
      productPost.isProductPostDeleted() ||
      productPost.getIsHidden() ||
      tradeStatus === TradeStatus.COMPLETED
    ) {
      return CheckSendPermissionResultDto.of(isSeller || isBuyer);
    }

    // 10. 판매중 또는 예약중 → 모든 참여자 발송 가능
    return CheckSendPermissionResultDto.of(true);
  }

  async generatePresignedUrlList(
    fileNames: string[],
  ): Promise<PresignedUrlDto[]> {
    return Promise.all(
      fileNames.map(async (fileName) => {
        const { presignedUrl, key } =
          await this.s3Service.generatePutPresignedUrl({
            fileName,
            path: 'conversation',
          });

        return PresignedUrlDto.of(presignedUrl, key);
      }),
    );
  }

  /**
   * 참여자의 뮤트 상태를 캐시에 업데이트합니다.
   *
   * @param conversationId 대화방 ID
   * @param userId 사용자 ID
   * @param isMuted 뮤트 상태
   */
  private async updateParticipantMutedCache(
    conversationId: number,
    userId: number,
    isMuted: boolean,
  ): Promise<void> {
    const participantCache =
      await this.participantCacheRepository.getParticipant(
        conversationId,
        userId,
      );

    if (!participantCache) {
      return;
    }

    participantCache.setIsMuted(isMuted);
    await this.participantCacheRepository.updateParticipant(
      conversationId,
      participantCache,
    );
  }
}
