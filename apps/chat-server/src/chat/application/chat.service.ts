import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Conversation,
  ConversationParticipant,
  ConversationMessage,
  ConversationMessageType,
  ConversationRepository,
  ConversationParticipantRepository,
  ConversationMessageRepository,
} from '@app/database';
import { RedisClient } from '@app/redis';
import { MessageResultDto } from './dto/message.result.dto';
import { ConversationListResultDto } from './dto/conversation-list.result.dto';
import {
  MessageEmissionResultDto,
  ReadEmissionResultDto,
} from './dto/websocket-emission.result.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: ConversationRepository,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: ConversationParticipantRepository,
    @InjectRepository(ConversationMessage)
    private readonly messageRepository: ConversationMessageRepository,
    private readonly redisClient: RedisClient,
  ) {}

  /**
   * 사용자의 WebSocket 연결을 인증하고 Redis에 세션 정보를 저장합니다.
   *
   * @param params.userId 사용자 ID
   * @param params.socketId WebSocket 소켓 ID
   */
  async authenticateUser(params: {
    userId: number;
    socketId: string;
  }): Promise<void> {
    // 1. Redis에 사용자-소켓 매핑 저장
    await this.redisClient.set(
      `user:${params.userId}:socketId`,
      params.socketId,
    );
    await this.redisClient.set(
      `socket:${params.socketId}:userId`,
      params.userId.toString(),
    );

    // 2. 사용자 상태를 채팅 목록으로 초기화
    await this.redisClient.set(`user:${params.userId}:status`, 'chat_list');

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
    const userId = await this.redisClient.get(
      `socket:${params.socketId}:userId`,
    );

    if (userId) {
      // 2. 모든 관련 Redis 키 삭제
      await this.redisClient.del(`user:${userId}:socketId`);
      await this.redisClient.del(`user:${userId}:status`);
      await this.redisClient.del(`socket:${params.socketId}:userId`);

      this.logger.log(`User ${userId} disconnected`);
    }
  }

  /**
   * 사용자의 현재 상태를 업데이트합니다.
   *
   * @param params.socketId WebSocket 소켓 ID
   * @param params.status 새로운 상태 값
   */
  async updateUserStatus(params: {
    socketId: string;
    status: string;
  }): Promise<void> {
    // 1. 소켓 ID로 사용자 ID 조회
    const userId = await this.redisClient.get(
      `socket:${params.socketId}:userId`,
    );

    if (userId) {
      // 2. Redis에 새로운 상태 저장
      await this.redisClient.set(`user:${userId}:status`, params.status);
      this.logger.log(`User ${userId} status updated to: ${params.status}`);
    }
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
    const userId = await this.redisClient.get(
      `socket:${params.socketId}:userId`,
    );
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * 사용자 ID로 소켓 ID를 조회합니다.
   *
   * @param params.userId 사용자 ID
   * @returns 소켓 ID (없으면 null)
   */
  async getUserSocketId(params: { userId: number }): Promise<string | null> {
    return this.redisClient.get(`user:${params.userId}:socketId`);
  }

  /**
   * 사용자의 현재 상태를 조회합니다.
   *
   * @param params.userId 사용자 ID
   * @returns 현재 상태 (없으면 null)
   */
  async getUserStatus(params: { userId: number }): Promise<string | null> {
    return this.redisClient.get(`user:${params.userId}:status`);
  }

  /**
   * 대화방에 메시지를 전송합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.senderId 발신자 ID
   * @param params.content 메시지 내용
   * @returns 전송된 메시지 정보와 WebSocket 전송 대상 목록
   */
  async sendMessage(params: {
    conversationId: number;
    senderId: number;
    content: string;
  }): Promise<MessageEmissionResultDto> {
    // 1. 대화방 존재 확인
    const conversation = await this.conversationRepository.findById(
      params.conversationId,
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 2. 다음 메시지 번호 계산
    const nextMessageNumber = (conversation.getLastMessageNumber() || 0) + 1;

    // 3. 새 메시지 엔티티 생성
    const message = this.messageRepository.create({
      conversationId: params.conversationId,
      senderId: params.senderId,
      content: params.content,
      messageNumber: nextMessageNumber,
      type: ConversationMessageType.TEXT,
    });

    // 4. 대화방 정보 업데이트
    conversation.setLastMessageNumber(nextMessageNumber);
    conversation.setLastSentAt(new Date());

    // 5. 데이터베이스에 저장
    await this.messageRepository.persistAndFlush(message);
    await this.conversationRepository.persistAndFlush(conversation);

    // 6. 대화 참여자들에게 전송할 WebSocket 이벤트 목록 생성
    const participants = await this.participantRepository.find({
      conversationId: params.conversationId,
      isDeleted: false,
    });

    const emissions = await Promise.all(
      participants
        .filter((participant) => participant.getUserId() !== params.senderId)
        .map(async (participant) => {
          const status = await this.getUserStatus({
            userId: participant.getUserId(),
          });

          if (status === `chat_room:${params.conversationId}`) {
            // 같은 채팅방에 있는 사용자에게 실시간 메시지 전송
            return {
              userId: participant.getUserId(),
              event: 'newMessage',
              data: {
                id: message.getId(),
                conversationId: params.conversationId,
                senderId: params.senderId,
                content: params.content,
                messageNumber: nextMessageNumber,
                createdAt: message.createdAt,
                type: ConversationMessageType.TEXT,
              },
            };
          }
          if (status === 'chat_list') {
            // 채팅 목록에 있는 사용자에게 대화방 업데이트 알림
            const conversationData = await this.getConversationListData({
              conversationId: params.conversationId,
              userId: participant.getUserId(),
            });
            return {
              userId: participant.getUserId(),
              event: 'chatRoomUpdated',
              data: conversationData,
            };
          }
          // 오프라인 사용자는 푸시 알림 대상 (TODO: SQS 구현 대기)
          this.logger.log(
            `User ${participant.getUserId()} is offline - TODO: Queue push notification`,
          );
          return null;
        }),
    );

    this.logger.log(
      `Message sent in conversation ${params.conversationId} by user ${params.senderId}`,
    );

    return {
      message: MessageResultDto.from(message),
      emissions: emissions.filter((emission) => emission !== null),
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
    // 1. 참여자 정보 확인
    const participant = await this.participantRepository.findOne({
      conversationId: params.conversationId,
      userId: params.userId,
      isDeleted: false,
    });

    if (!participant) {
      throw new Error('Participant not found in conversation');
    }

    // 2. 읽음 처리 정보 업데이트
    participant.setLastReadMessageNumber(params.lastReadMessageNumber);
    await this.participantRepository.persistAndFlush(participant);

    // 3. 다른 참여자들에게 전송할 읽음 알림 목록 생성
    const otherParticipants = await this.participantRepository.find({
      conversationId: params.conversationId,
      userId: { $ne: params.userId },
      isDeleted: false,
    });

    const emissions = await Promise.all(
      otherParticipants.map(async (otherParticipant) => {
        const status = await this.getUserStatus({
          userId: otherParticipant.getUserId(),
        });

        if (status === `chat_room:${params.conversationId}`) {
          return {
            userId: otherParticipant.getUserId(),
            event: 'messageRead',
            data: {
              conversationId: params.conversationId,
              userId: params.userId,
              lastReadMessageNumber: params.lastReadMessageNumber,
            },
          };
        }
        return null;
      }),
    );

    this.logger.log(
      `User ${params.userId} marked messages as read up to ${params.lastReadMessageNumber} in conversation ${params.conversationId}`,
    );

    return {
      emissions: emissions.filter((emission) => emission !== null),
    };
  }

  /**
   * 채팅 목록용 대화방 데이터를 조회합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.userId 사용자 ID
   * @returns 대화방 목록 데이터
   * @private
   */
  private async getConversationListData(params: {
    conversationId: number;
    userId: number;
  }): Promise<ConversationListResultDto | null> {
    // 1. 대화방 및 참여자 정보 조회
    const conversation = await this.conversationRepository.findById(
      params.conversationId,
    );
    const participant = await this.participantRepository.findOne({
      conversationId: params.conversationId,
      userId: params.userId,
      isDeleted: false,
    });

    if (!conversation || !participant) {
      return null;
    }

    // 2. 마지막 메시지 조회
    const lastMessage = await this.messageRepository.findOne(
      { conversationId: params.conversationId },
      { orderBy: { messageNumber: 'DESC' } },
    );

    // 3. 읽지 않은 메시지 수 계산
    const unreadCount =
      lastMessage && participant.getLastReadMessageNumber()
        ? Math.max(
            0,
            lastMessage.getMessageNumber() -
              (participant.getLastReadMessageNumber() || 0),
          )
        : 0;

    return ConversationListResultDto.of({
      conversationId: params.conversationId,
      lastMessage: lastMessage?.getContent() || null,
      lastSentAt: conversation.getLastSentAt(),
      unreadCount,
      lastMessageNumber: conversation.getLastMessageNumber(),
    });
  }
}
