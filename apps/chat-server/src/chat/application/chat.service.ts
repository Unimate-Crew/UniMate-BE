import { Injectable, Logger } from '@nestjs/common';
import {
  Conversation,
  ConversationParticipant,
  ConversationMessage,
  ConversationMessageType,
  ConversationRepository,
  ConversationParticipantRepository,
  ConversationMessageRepository,
} from '@app/database';
import {
  SessionCacheRepository,
  RoomOnlineCacheRepository,
  ParticipantCacheRepository,
  ConversationParticipantCache,
} from '@app/redis';
import { ErrorCode } from '@app/common';
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

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantRepository: ConversationParticipantRepository,
    private readonly messageRepository: ConversationMessageRepository,
    private readonly sessionCacheRepository: SessionCacheRepository,
    private readonly roomOnlineCacheRepository: RoomOnlineCacheRepository,
    private readonly participantCacheRepository: ParticipantCacheRepository,
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

    if (userIdNum) {
      // 2. 모든 채팅방에서 사용자 제거
      await this.removeUserFromAllOnlineConversations({ userId: userIdNum });

      // 3. 모든 관련 Redis 키 삭제
      await this.sessionCacheRepository.clearUserSession(
        userIdNum,
        params.socketId,
      );

      this.logger.log(`User ${userIdNum} disconnected`);
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
    await this.roomOnlineCacheRepository.removeUserFromAllRooms(params.userId);

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
    await this.roomOnlineCacheRepository.addUserToRoom(
      params.conversationId,
      params.userId,
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
    await this.roomOnlineCacheRepository.removeUserFromRoom(
      params.conversationId,
      params.userId,
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

    if (participantCache) {
      participantCache.setLastReadMessageNumber(params.lastReadMessageNumber);
      await this.participantCacheRepository.updateParticipant(
        params.conversationId,
        participantCache,
      );
    }
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
    return this.conversationRepository
      .getEntityManager()
      .transactional(async () => {
        // 1. 대화방 존재 확인
        const conversation: Conversation | null =
          await this.conversationRepository.findById(params.conversationId);
        if (!conversation) {
          throw WebSocketChatException.withCode(
            ErrorCode.CONVERSATION_NOT_FOUND,
          );
        }

        // 2. 다음 메시지 번호 계산
        const nextMessageNumber: number =
          (conversation.getLastMessageNumber() || 0) + 1;

        // 3. 새 메시지 엔티티 생성
        const message: ConversationMessage = this.messageRepository.create({
          conversationId: params.conversationId,
          senderId: params.senderId,
          content: params.content,
          messageNumber: nextMessageNumber,
          type: params.type,
        });

        // 4. 대화방 정보 업데이트
        conversation.setLastMessageNumber(nextMessageNumber);
        conversation.setLastSentAt(new Date());

        // 5. 데이터베이스에 저장
        await this.messageRepository.persistAndFlush(message);
        await this.conversationRepository.persistAndFlush(conversation);

        // 6. 대화 참여자들에게 전송할 WebSocket 이벤트 목록 생성
        let participants: CachedConversationParticipantDto[] | null =
          await this.getCachedConversationParticipants({
            conversationId: params.conversationId,
          });

        if (!participants) {
          // 7. DB에서 참여자 정보 조회 후 캐시에 저장
          const dbParticipants: ConversationParticipant[] =
            await this.participantRepository.find({
              conversationId: params.conversationId,
              isDeleted: false,
            });

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
            conversationId: params.conversationId,
            participants: cachedParticipants,
          });

          participants = cachedParticipants;
        }

        // 8. 온라인 사용자 목록 조회
        const onlineUsers: number[] = await this.getOnlineUsersInConversation({
          conversationId: params.conversationId,
        });

        // 9. WebSocket 이벤트 전송 대상 목록 생성
        const emissions = participants
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
                  type: message.getType(),
                  requestId: params.requestId,
                },
              };
            }

            // 오프라인 사용자에게는 발송자 제외하고 채팅방 업데이트 알림
            if (participant.userId === params.senderId) {
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
          })
          .filter((emission) => emission !== null);

        this.logger.log(
          `Message sent in conversation ${params.conversationId} by user ${params.senderId}`,
        );

        return {
          message: MessageResultDto.from(message),
          emissions,
        };
      });
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

        this.logger.log(
          `User ${params.userId} marked messages as read up to ${params.lastReadMessageNumber} in conversation ${params.conversationId}`,
        );

        return {
          emissions,
        };
      });
  }
}
