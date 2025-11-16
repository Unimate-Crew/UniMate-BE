import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Conversation,
  ConversationParticipant,
  ConversationMessage,
  ConversationMessageType,
  ConversationRepository,
  ConversationParticipantRepository,
  ConversationMessageRepository,
  UserRepository,
  DeviceRepository,
  NotificationType,
} from '@app/database';
import {
  SessionCacheRepository,
  RoomOnlineCacheRepository,
  ParticipantCacheRepository,
  ConversationParticipantCache,
  UserOnlineRoomsCacheRepository,
} from '@app/redis';
import { ErrorCode } from '@app/common';
import { SqsClient } from '@app/common/sqs/sqs.client';
import { WebSocketChatException } from '../../common/exceptions/websocket-chat.exception';
import { MessageResultDto } from './dto/message.result.dto';
import {
  MessageEmissionResultDto,
  ReadEmissionResultDto,
} from './dto/websocket-emission.result.dto';
import { CachedConversationParticipantDto } from './dto/cached-conversation-participant.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private readonly MAX_PUSH_MESSAGE_LENGTH = 100;

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantRepository: ConversationParticipantRepository,
    private readonly messageRepository: ConversationMessageRepository,
    private readonly sessionCacheRepository: SessionCacheRepository,
    private readonly roomOnlineCacheRepository: RoomOnlineCacheRepository,
    private readonly participantCacheRepository: ParticipantCacheRepository,
    private readonly userOnlineRoomsCacheRepository: UserOnlineRoomsCacheRepository,
    private readonly userRepository: UserRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly sqsClient: SqsClient,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 사용자의 WebSocket 세션을 등록하고 Redis에 세션 정보를 저장합니다.
   *
   * @param params.userId 사용자 ID
   * @param params.socketId WebSocket 소켓 ID
   */
  async registerUserSession(params: {
    userId: number;
    socketId: string;
  }): Promise<void> {
    await this.sessionCacheRepository.setUserSocket(
      params.userId,
      params.socketId,
    );

    this.logger.log(
      `User ${params.userId} authenticated with socket ${params.socketId}`,
    );
  }

  /**
   * 사용자 연결 해제 처리 및 Redis 세션 정리를 수행합니다.
   *
   * @param params.socketId WebSocket 소켓 ID
   */
  async handleUserDisconnect(params: { socketId: string }): Promise<void> {
    // 1. Redis에서 사용자 ID 조회
    const userIdNum = await this.sessionCacheRepository.getSocketUser(
      params.socketId,
    );

    if (!userIdNum) {
      return;
    }

    // 2. 사용자가 접속한 모든 대화방 목록 조회 (KEYS 대신 사용자별 목록 사용)
    const onlineRooms =
      await this.userOnlineRoomsCacheRepository.getUserOnlineRooms(userIdNum);

    // 3. 각 대화방에서 사용자 제거
    await Promise.all(
      onlineRooms.map((conversationId) =>
        this.roomOnlineCacheRepository.removeUserFromRoom(
          conversationId,
          userIdNum,
        ),
      ),
    );

    // 4. 사용자 온라인 룸 목록 삭제
    await this.userOnlineRoomsCacheRepository.clearUserOnlineRooms(userIdNum);

    // 5. 세션 정리
    await this.sessionCacheRepository.clearUserSession(
      userIdNum,
      params.socketId,
    );

    this.logger.log(
      `User ${userIdNum} disconnected from ${onlineRooms.length} rooms`,
    );
  }

  /**
   * 소켓 ID로 사용자 ID를 조회합니다.
   *
   * @param params.socketId WebSocket 소켓 ID
   * @returns 사용자 ID (없으면 null)
   */
  async getUserIdBySocketId(params: {
    socketId: string;
  }): Promise<number | null> {
    return this.sessionCacheRepository.getSocketUser(params.socketId);
  }

  /**
   * 대화방에 온라인 사용자를 추가합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.userId 사용자 ID
   */
  async addUserToOnlineConversation(params: {
    conversationId: number;
    userId: number;
  }): Promise<void> {
    await Promise.all([
      this.roomOnlineCacheRepository.addUserToRoom(
        params.conversationId,
        params.userId,
      ),
      this.userOnlineRoomsCacheRepository.addRoomToUser(
        params.userId,
        params.conversationId,
      ),
    ]);
    this.logger.log(
      `User ${params.userId} added to online conversation ${params.conversationId}`,
    );
  }

  /**
   * 대화방에서 온라인 사용자를 제거합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.userId 사용자 ID
   */
  async removeUserFromOnlineConversation(params: {
    conversationId: number;
    userId: number;
  }): Promise<void> {
    await Promise.all([
      this.roomOnlineCacheRepository.removeUserFromRoom(
        params.conversationId,
        params.userId,
      ),
      this.userOnlineRoomsCacheRepository.removeRoomFromUser(
        params.userId,
        params.conversationId,
      ),
    ]);
    this.logger.log(
      `User ${params.userId} removed from online conversation ${params.conversationId}`,
    );
  }

  /**
   * 대화방의 온라인 사용자 목록을 조회합니다.
   *
   * @param params.conversationId 대화방 ID
   * @returns 온라인 사용자 ID 목록
   */
  async getOnlineUsersInConversation(params: {
    conversationId: number;
  }): Promise<number[]> {
    return this.roomOnlineCacheRepository.getOnlineUsers(params.conversationId);
  }

  /**
   * 대화방 참여자 정보를 캐시에 저장합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.participants 참여자 정보 목록
   */
  async cacheConversationParticipants(params: {
    conversationId: number;
    participants: CachedConversationParticipantDto[];
  }): Promise<void> {
    const participantCaches = params.participants.map((participant) =>
      ConversationParticipantCache.from({
        userId: participant.userId,
        lastReadMessageNumber: participant.lastReadMessageNumber,
        isBlockingOther: participant.isBlockingOther,
        isMuted: participant.isMuted,
      }),
    );

    await this.participantCacheRepository.setParticipants(
      params.conversationId,
      participantCaches,
    );

    this.logger.log(
      `Cached ${params.participants.length} participants for conversation ${params.conversationId}`,
    );
  }

  /**
   * 캐시에서 대화방 참여자 정보를 조회합니다.
   *
   * @param params.conversationId 대화방 ID
   * @returns 참여자 정보 목록
   */
  async getCachedConversationParticipants(params: {
    conversationId: number;
  }): Promise<CachedConversationParticipantDto[] | null> {
    const participantCaches =
      await this.participantCacheRepository.getParticipants(
        params.conversationId,
      );

    if (!participantCaches || participantCaches.length === 0) {
      return null;
    }

    return participantCaches.map((cache) =>
      CachedConversationParticipantDto.from({
        userId: cache.getUserId(),
        lastReadMessageNumber: cache.getLastReadMessageNumber(),
        isBlockingOther: cache.getIsBlockingOther(),
        isMuted: cache.getIsMuted(),
      }),
    );
  }

  /**
   * 캐시에서 특정 참여자의 마지막 읽은 메시지를 업데이트합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.userId 사용자 ID
   * @param params.lastReadMessageNumber 마지막으로 읽은 메시지 번호
   */
  async updateCachedParticipantLastReadMessage(params: {
    conversationId: number;
    userId: number;
    lastReadMessageNumber: number;
  }): Promise<void> {
    const participantCache =
      await this.participantCacheRepository.getParticipant(
        params.conversationId,
        params.userId,
      );

    if (!participantCache) {
      return;
    }

    participantCache.setLastReadMessageNumber(params.lastReadMessageNumber);
    await this.participantCacheRepository.updateParticipant(
      params.conversationId,
      participantCache,
    );
  }

  /**
   * 대화방에 메시지를 전송합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.senderId 발신자 ID
   * @param params.content 메시지 내용
   * @param params.type 메시지 타입
   * @returns 전송된 메시지 정보와 WebSocket 전송 대상 목록
   */
  async sendMessage(params: {
    conversationId: number;
    senderId: number;
    content: string;
    type: ConversationMessageType;
    requestId?: string;
  }): Promise<MessageEmissionResultDto> {
    // 1. 참여자 정보 로드 (캐시 또는 DB)
    const participants = await this.loadParticipants(params.conversationId);

    // 2. 발신자가 상대방을 차단했는지 검증
    this.validateSenderNotBlocking(participants, params.senderId);

    // 3. 메시지 저장 (트랜잭션)
    const message = await this.saveMessage(params);

    // 4. 온라인 사용자 조회 및 이벤트 생성
    const onlineUsers = await this.getOnlineUsersInConversation({
      conversationId: params.conversationId,
    });

    const emissions = this.createEmissions(
      participants,
      onlineUsers,
      message,
      params,
    );

    // 5. 오프라인 사용자에게 푸시알림 발송
    await this.sendPushNotificationsToOfflineUsers(
      participants,
      onlineUsers,
      params,
    );

    // 6. 참여자 캐시 TTL 갱신 (활성 대화방 유지)
    await this.participantCacheRepository.refreshTTL(params.conversationId);

    // 7. 로깅 및 반환
    this.logger.log(
      `Message sent in conversation ${params.conversationId} by user ${params.senderId}`,
    );

    return {
      message: MessageResultDto.from(message),
      emissions,
    };
  }

  /**
   * 메시지를 읽음 처리합니다.
   *
   * @param params.userId 사용자 ID
   * @param params.conversationId 대화방 ID
   * @param params.lastReadMessageNumber 마지막으로 읽은 메시지 번호
   * @returns WebSocket 전송 대상 목록
   */
  async markMessagesAsRead(params: {
    userId: number;
    conversationId: number;
    lastReadMessageNumber: number;
  }): Promise<ReadEmissionResultDto> {
    return this.participantRepository
      .getEntityManager()
      .transactional(async () => {
        // 1. 참여자 정보 확인
        const participant: ConversationParticipant | null =
          await this.participantRepository.findOne({
            conversationId: params.conversationId,
            userId: params.userId,
            isDeleted: false,
          });

        if (!participant) {
          throw WebSocketChatException.withCode(
            ErrorCode.PARTICIPANT_NOT_FOUND,
          );
        }

        // 2. 읽음 처리 정보 업데이트 (데이터베이스)
        participant.setLastReadMessageNumber(params.lastReadMessageNumber);
        await this.participantRepository.persistAndFlush(participant);

        // 3. 캐시 정보 업데이트
        await this.updateCachedParticipantLastReadMessage({
          conversationId: params.conversationId,
          userId: params.userId,
          lastReadMessageNumber: params.lastReadMessageNumber,
        });

        // 4. 온라인 사용자 목록 조회
        const onlineUsers: number[] = await this.getOnlineUsersInConversation({
          conversationId: params.conversationId,
        });

        // 5. 같은 채팅방에 있는 다른 참여자들에게 읽음 알림 전송
        const emissions = onlineUsers
          .filter((userId) => userId !== params.userId)
          .map((userId) => ({
            userId,
            event: 'messageRead',
            data: {
              conversationId: params.conversationId,
              userId: params.userId,
              lastReadMessageNumber: params.lastReadMessageNumber,
            },
          }));

        // 6. 참여자 캐시 TTL 갱신 (활성 대화방 유지)
        await this.participantCacheRepository.refreshTTL(params.conversationId);

        this.logger.log(
          `User ${params.userId} marked messages as read up to ${params.lastReadMessageNumber} in conversation ${params.conversationId}`,
        );

        return {
          emissions,
        };
      });
  }

  /**
   * 대화방 참여자 정보를 로드합니다 (캐시 또는 DB).
   *
   * @param conversationId 대화방 ID
   * @returns 참여자 정보 목록
   */
  private async loadParticipants(
    conversationId: number,
  ): Promise<CachedConversationParticipantDto[]> {
    // 캐시에서 참여자 정보 조회
    const participants = await this.getCachedConversationParticipants({
      conversationId,
    });

    if (participants) {
      return participants;
    }

    // 캐시에 없으면 DB에서 조회 후 캐시에 저장
    const dbParticipants: ConversationParticipant[] =
      await this.participantRepository.findByConversationId(conversationId);

    const cachedParticipants: CachedConversationParticipantDto[] =
      dbParticipants.map((p) =>
        CachedConversationParticipantDto.from({
          userId: p.getUserId(),
          lastReadMessageNumber: p.getLastReadMessageNumber(),
          isBlockingOther: p.getIsBlockingOther(),
          isMuted: p.getIsMuted(),
        }),
      );

    await this.cacheConversationParticipants({
      conversationId,
      participants: cachedParticipants,
    });

    return cachedParticipants;
  }

  /**
   * 발신자가 상대방을 차단했는지 검증합니다.
   *
   * @param participants 참여자 목록
   * @param senderId 발신자 ID
   * @throws WebSocketChatException 발신자가 상대방을 차단한 경우
   */
  private validateSenderNotBlocking(
    participants: CachedConversationParticipantDto[],
    senderId: number,
  ): void {
    const senderParticipant = participants.find((p) => p.userId === senderId);

    if (senderParticipant?.isBlockingOther) {
      throw WebSocketChatException.withCode(
        ErrorCode.CONVERSATION_MESSAGE_BLOCKED,
      );
    }
  }

  /**
   * 메시지를 저장합니다 (트랜잭션).
   *
   * @param params 메시지 저장 파라미터
   * @returns 저장된 메시지
   */
  private async saveMessage(params: {
    conversationId: number;
    senderId: number;
    content: string;
    type: ConversationMessageType;
  }): Promise<ConversationMessage> {
    return this.conversationRepository
      .getEntityManager()
      .transactional(async () => {
        // 비관적 락으로 conversation 조회 (FOR UPDATE)
        const conversation: Conversation | null =
          await this.conversationRepository.findByIdWithLock(
            params.conversationId,
          );

        if (!conversation) {
          throw WebSocketChatException.withCode(
            ErrorCode.CONVERSATION_NOT_FOUND,
          );
        }

        const nextMessageNumber: number =
          (conversation.getLastMessageNumber() || 0) + 1;

        const newMessage: ConversationMessage = this.messageRepository.create({
          conversationId: params.conversationId,
          senderId: params.senderId,
          content: params.content,
          messageNumber: nextMessageNumber,
          type: params.type,
        });

        conversation.setLastMessageNumber(nextMessageNumber);
        conversation.setLastSentAt(new Date());

        await this.messageRepository.persistAndFlush(newMessage);
        await this.conversationRepository.persistAndFlush(conversation);

        return newMessage;
      });
  }

  /**
   * 온라인 사용자에 대한 WebSocket emission을 생성합니다.
   *
   * @param participant 참여자 정보
   * @param message 메시지
   * @param params 메시지 파라미터
   * @returns WebSocket emission (차단된 경우 null)
   */
  private createEmissionForOnlineUser(
    participant: CachedConversationParticipantDto,
    message: ConversationMessage,
    params: {
      conversationId: number;
      senderId: number;
      content: string;
      requestId?: string;
    },
  ): { userId: number; event: string; data: any } | null {
    // 온라인 사용자 중 발신자가 아닌데 발신자를 차단한 경우 null 반환
    if (participant.userId !== params.senderId && participant.isBlockingOther) {
      return null;
    }

    return {
      userId: participant.userId,
      event: 'newMessage',
      data: {
        id: message.getId(),
        conversationId: params.conversationId,
        senderId: params.senderId,
        content: params.content,
        messageNumber: message.getMessageNumber(),
        createdAt: message.createdAt,
        type: message.getType(),
        requestId: params.requestId,
      },
    };
  }

  /**
   * 오프라인 사용자에 대한 WebSocket emission을 생성합니다.
   *
   * @param participant 참여자 정보
   * @param nextMessageNumber 다음 메시지 번호
   * @param params 메시지 파라미터
   * @returns WebSocket emission (발신자이거나 차단된 경우 null)
   */
  private createEmissionForOfflineUser(
    participant: CachedConversationParticipantDto,
    nextMessageNumber: number,
    params: {
      conversationId: number;
      senderId: number;
      content: string;
    },
  ): { userId: number; event: string; data: any } | null {
    // 발신자는 제외
    if (participant.userId === params.senderId) {
      return null;
    }

    // 발신자를 차단한 경우 제외
    if (participant.isBlockingOther) {
      return null;
    }

    return {
      userId: participant.userId,
      event: 'chatRoomUpdated',
      data: {
        conversationId: params.conversationId,
        lastMessage: params.content,
        lastSentAt: new Date(),
        unreadCount: Math.max(
          0,
          nextMessageNumber - (participant.lastReadMessageNumber || 0),
        ),
        lastMessageNumber: nextMessageNumber,
      },
    };
  }

  /**
   * 모든 참여자에 대한 WebSocket emissions를 생성합니다.
   *
   * @param participants 참여자 목록
   * @param onlineUsers 온라인 사용자 ID 목록
   * @param message 메시지
   * @param params 메시지 파라미터
   * @returns WebSocket emissions
   */
  private createEmissions(
    participants: CachedConversationParticipantDto[],
    onlineUsers: number[],
    message: ConversationMessage,
    params: {
      conversationId: number;
      senderId: number;
      content: string;
      requestId?: string;
    },
  ): Array<{ userId: number; event: string; data: any }> {
    const nextMessageNumber = message.getMessageNumber();

    return participants
      .map((participant) => {
        if (onlineUsers.includes(participant.userId)) {
          return this.createEmissionForOnlineUser(participant, message, params);
        }

        return this.createEmissionForOfflineUser(
          participant,
          nextMessageNumber,
          params,
        );
      })
      .filter(
        (emission): emission is { userId: number; event: string; data: any } =>
          emission !== null,
      );
  }

  /**
   * 오프라인 사용자들의 푸시알림 메시지를 생성합니다.
   *
   * @param offlineUserIds 오프라인 사용자 ID 목록
   * @param senderId 발신자 ID
   * @param conversationId 대화방 ID
   * @param messageType 메시지 타입
   * @param content 메시지 내용
   * @returns SQS 푸시 메시지 배열
   */
  private async buildPushMessages(
    offlineUserIds: number[],
    senderId: number,
    conversationId: number,
    messageType: ConversationMessageType,
    content: string,
  ): Promise<any[]> {
    // 발신자 정보 조회 (닉네임)
    const sender = await this.userRepository.findOne({
      id: senderId,
    });

    if (!sender) {
      return [];
    }

    const senderNickname = sender.getNickname();

    // 오프라인 사용자들의 디바이스 토큰 조회
    const devices = await this.deviceRepository.findByUserIds(offlineUserIds);

    // userId별 디바이스 토큰 매핑
    const userDeviceTokensMap = new Map<number, string[]>();
    devices.forEach((device) => {
      const userId = device.getUserId();
      const existing = userDeviceTokensMap.get(userId) || [];
      userDeviceTokensMap.set(userId, [...existing, device.getDeviceToken()]);
    });

    // SQS 메시지 생성
    return offlineUserIds
      .map((userId) => {
        const deviceTokens = userDeviceTokensMap.get(userId) || [];

        // 디바이스 토큰이 없으면 메시지 생성 안 함
        if (deviceTokens.length === 0) {
          return null;
        }

        return {
          type: NotificationType.NEW_CHAT_MESSAGE,
          userId,
          deviceTokens,
          conversationId,
          message: {
            title: `${senderNickname}님이 메시지를 보냈어요`,
            body: this.getPushMessageBody(messageType, content),
          },
          timestamp: new Date().toISOString(),
        };
      })
      .filter((msg): msg is Exclude<typeof msg, null> => msg !== null);
  }

  /**
   * SQS에 푸시 메시지를 발송합니다.
   *
   * @param pushMessages 푸시 메시지 배열
   * @param queueUrl SQS Queue URL
   * @param conversationId 대화방 ID
   */
  private async sendPushMessagesToSqs(
    pushMessages: any[],
    queueUrl: string,
    conversationId: number,
  ): Promise<void> {
    if (pushMessages.length === 0) {
      this.logger.log(
        `오프라인 사용자 중 디바이스 토큰이 없는 사용자만 있음 (대화방: ${conversationId})`,
      );
      return;
    }

    await this.sqsClient.sendMessageBatch(queueUrl, pushMessages);
    this.logger.log(
      `푸시알림 ${pushMessages.length}개 발송 완료 (대화방: ${conversationId})`,
    );
  }

  /**
   * 오프라인 사용자에게 푸시알림을 발송합니다.
   *
   * @param participants 참여자 목록
   * @param onlineUsers 온라인 사용자 ID 목록
   * @param params 메시지 파라미터
   */
  private async sendPushNotificationsToOfflineUsers(
    participants: CachedConversationParticipantDto[],
    onlineUsers: number[],
    params: {
      conversationId: number;
      senderId: number;
      content: string;
      type: ConversationMessageType;
    },
  ): Promise<void> {
    // 오프라인 사용자 필터링
    const offlineUserIds = participants
      .filter(
        (p) =>
          !onlineUsers.includes(p.userId) &&
          p.userId !== params.senderId &&
          !p.isBlockingOther,
      )
      .map((p) => p.userId);

    if (offlineUserIds.length === 0) {
      return;
    }

    // Queue URL 확인
    const queueUrl = this.configService.get<string>(
      'PUSH_NOTIFICATION_QUEUE_URL',
    );

    if (!queueUrl) {
      this.logger.warn(
        'PUSH_NOTIFICATION_QUEUE_URL이 설정되지 않아 푸시알림을 전송하지 않습니다.',
      );
      return;
    }

    try {
      const pushMessages = await this.buildPushMessages(
        offlineUserIds,
        params.senderId,
        params.conversationId,
        params.type,
        params.content,
      );

      await this.sendPushMessagesToSqs(
        pushMessages,
        queueUrl,
        params.conversationId,
      );
    } catch (error) {
      this.logger.error(
        `푸시알림 발송 실패 (대화방: ${params.conversationId}): ${error.message}`,
        error.stack,
      );
      // 푸시알림 실패해도 메시지 전송은 정상 처리
    }
  }

  /**
   * 메시지 타입에 따른 푸시알림 본문을 생성합니다.
   *
   * @param messageType 메시지 타입
   * @param content 메시지 내용
   * @returns 푸시알림 본문
   */
  private getPushMessageBody(
    messageType: ConversationMessageType,
    content: string,
  ): string {
    switch (messageType) {
      case ConversationMessageType.TEXT:
        return content.length > this.MAX_PUSH_MESSAGE_LENGTH
          ? `${content.substring(0, this.MAX_PUSH_MESSAGE_LENGTH)}...`
          : content;
      case ConversationMessageType.IMAGE:
        return '사진을 보냈습니다';
      case ConversationMessageType.VIDEO:
        return '동영상을 보냈습니다';
      case ConversationMessageType.SYSTEM:
        return content;
      default:
        return content;
    }
  }
}
