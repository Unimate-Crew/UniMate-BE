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
import { WebSocketChatException } from '../../common/exceptions/websocket-chat.exception';
import { WebSocketErrorCode } from '../../common/websocket-error-codes';
import { MessageResultDto } from './dto/message.result.dto';
import {
  MessageEmissionResultDto,
  ReadEmissionResultDto,
} from './dto/websocket-emission.result.dto';
import { CachedConversationParticipantDto } from './dto/cached-conversation-participant.dto';

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
   * 사용자의 WebSocket 세션을 등록하고 Redis에 세션 정보를 저장합니다.
   *
   * @param params.userId 사용자 ID
   * @param params.socketId WebSocket 소켓 ID
   */
  async registerUserSession(params: {
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
      const userIdNum = parseInt(userId, 10);

      // 2. 모든 채팅방에서 사용자 제거
      await this.removeUserFromAllOnlineConversations({ userId: userIdNum });

      // 3. 모든 관련 Redis 키 삭제
      await this.redisClient.del(`user:${userId}:socketId`);
      await this.redisClient.del(`socket:${params.socketId}:userId`);

      this.logger.log(`User ${userId} disconnected`);
    }
  }

  /**
   * 사용자를 모든 온라인 대화방에서 제거합니다.
   *
   * @param params.userId 사용자 ID
   */
  async removeUserFromAllOnlineConversations(params: {
    userId: number;
  }): Promise<void> {
    const client = this.redisClient.getClient();

    // room:*:online 패턴의 모든 키를 찾고 해당 사용자를 제거
    const keys = await client.keys('room:*:online');

    await Promise.all(
      keys.map((key) => client.srem(key, params.userId.toString())),
    );

    this.logger.log(
      `User ${params.userId} removed from all online conversations`,
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
    const userId = await this.redisClient.get(
      `socket:${params.socketId}:userId`,
    );
    return userId ? parseInt(userId, 10) : null;
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
    const client = this.redisClient.getClient();
    await client.sadd(
      `room:${params.conversationId}:online`,
      params.userId.toString(),
    );
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
    const client = this.redisClient.getClient();
    await client.srem(
      `room:${params.conversationId}:online`,
      params.userId.toString(),
    );
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
    const client = this.redisClient.getClient();
    const userIds = await client.smembers(
      `room:${params.conversationId}:online`,
    );
    return userIds.map((id: string) => parseInt(id, 10));
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
    const key = `room:${params.conversationId}:participants`;
    const participantData: Record<string, string> = {};

    params.participants.forEach((participant) => {
      participantData[participant.userId.toString()] = JSON.stringify(
        participant.toJSON(),
      );
    });

    const client = this.redisClient.getClient();
    await client.hset(key, participantData);
    // 24시간 TTL 설정
    await client.expire(key, 86400);

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
    const key = `room:${params.conversationId}:participants`;
    const client = this.redisClient.getClient();
    const participantData = await client.hgetall(key);

    if (!participantData || Object.keys(participantData).length === 0) {
      return null;
    }

    return Object.values(participantData).map((data) => {
      const parsed = JSON.parse(data);
      return CachedConversationParticipantDto.from(parsed);
    });
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
    const key = `room:${params.conversationId}:participants`;
    const client = this.redisClient.getClient();
    const existingData = await client.hget(key, params.userId.toString());

    if (existingData) {
      const participantInfo = JSON.parse(existingData);
      participantInfo.lastReadMessageNumber = params.lastReadMessageNumber;

      await client.hset(
        key,
        params.userId.toString(),
        JSON.stringify(participantInfo),
      );
    }
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
      throw WebSocketChatException.withCode(WebSocketErrorCode.CONV001);
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
    // 먼저 캐시에서 참여자 정보 조회, 없으면 DB에서 조회 후 캐시
    let participants = await this.getCachedConversationParticipants({
      conversationId: params.conversationId,
    });

    if (!participants) {
      // DB에서 참여자 정보 조회
      const dbParticipants = await this.participantRepository.find({
        conversationId: params.conversationId,
        isDeleted: false,
      });

      // 캐시에 저장
      const cachedParticipants = dbParticipants.map((p) =>
        CachedConversationParticipantDto.from({
          userId: p.getUserId(),
          lastReadMessageNumber: p.getLastReadMessageNumber(),
          status: p.getStatus(),
        }),
      );

      await this.cacheConversationParticipants({
        conversationId: params.conversationId,
        participants: cachedParticipants,
      });

      participants = cachedParticipants;
    }

    // 온라인 사용자 목록 조회
    const onlineUsers = await this.getOnlineUsersInConversation({
      conversationId: params.conversationId,
    });

    const emissions = participants
      .filter((participant) => participant.userId !== params.senderId)
      .map((participant) => {
        if (onlineUsers.includes(participant.userId)) {
          // 온라인 사용자에게 실시간 메시지 전송
          return {
            userId: participant.userId,
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

        // 오프라인 사용자에게 채팅방 업데이트 알림 + 푸시 알림
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
      });

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
    // 1. 참여자 정보 확인
    const participant = await this.participantRepository.findOne({
      conversationId: params.conversationId,
      userId: params.userId,
      isDeleted: false,
    });

    if (!participant) {
      throw WebSocketChatException.withCode(WebSocketErrorCode.CONV002);
    }

    // 2. 읽음 처리 정보 업데이트 (DB + 캐시)
    participant.setLastReadMessageNumber(params.lastReadMessageNumber);
    await this.participantRepository.persistAndFlush(participant);

    // 캐시도 업데이트
    await this.updateCachedParticipantLastReadMessage({
      conversationId: params.conversationId,
      userId: params.userId,
      lastReadMessageNumber: params.lastReadMessageNumber,
    });

    // 3. 같은 채팅방에 온라인으로 있는 다른 참여자들에게만 읽음 알림 전송
    const onlineUsers = await this.getOnlineUsersInConversation({
      conversationId: params.conversationId,
    });

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

    this.logger.log(
      `User ${params.userId} marked messages as read up to ${params.lastReadMessageNumber} in conversation ${params.conversationId}`,
    );

    return {
      emissions,
    };
  }
}
