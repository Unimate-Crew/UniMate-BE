import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisClient } from '@app/redis';
import { ChatService } from '../application/chat.service';
import { SendMessageRequestDto } from './dto/send-message.request.dto';
import { MarkMessagesAsReadRequestDto } from './dto/mark-messages-as-read.request.dto';
import { AuthenticateUserRequestDto } from './dto/authenticate-user.request.dto';
import { JoinRoomRequestDto } from './dto/join-room.request.dto';
import { UpdateUserStatusRequestDto } from './dto/update-user-status.request.dto';
import {
  WebSocketSuccessResponseDto,
  WebSocketErrorResponseDto,
} from './dto/websocket-response.dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly redisClient: RedisClient,
  ) {}

  async afterInit(server: Server): Promise<void> {
    try {
      const pubClient = this.redisClient.getClient();
      const subClient = pubClient.duplicate();

      // Redis 연결 대기
      if (pubClient.status !== 'ready') {
        await new Promise((resolve) => {
          pubClient.once('ready', resolve);
        });
      }

      await subClient.connect();

      server.adapter(createAdapter(pubClient, subClient));
      this.logger.log('Socket.IO Redis adapter configured successfully');
    } catch (error) {
      this.logger.error('Failed to configure Redis adapter:', error);
      throw error;
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // 사용자 ID 조회 후 사용자별 방에서 나가기
    const userId = await this.chatService.getUserIdBySocketId({
      socketId: client.id,
    });
    if (userId) {
      client.leave(`user_${userId}`);
    }

    await this.chatService.handleUserDisconnect({ socketId: client.id });
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() data: AuthenticateUserRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.authenticateUser({
        userId: data.userId,
        socketId: client.id,
      });

      // 사용자별 방에 조인하여 인스턴스 간 메시지 전송 가능하게 함
      client.join(`user_${data.userId}`);

      client.emit(
        'authenticated',
        WebSocketSuccessResponseDto.of({
          message: 'Authentication successful',
        }),
      );
    } catch (error) {
      this.logger.error('Failed to authenticate user:', error);
      client.emit(
        'authenticated',
        WebSocketErrorResponseDto.of('Authentication failed', 'AUTH001'),
      );
    }
  }

  @SubscribeMessage('updateStatus')
  async handleUpdateStatus(
    @MessageBody() data: UpdateUserStatusRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.updateUserStatus({
      socketId: client.id,
      status: data.status,
    });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const roomName = `conversation_${data.conversationId}`;
      client.join(roomName);
      await this.chatService.updateUserStatus({
        socketId: client.id,
        status: `chat_room:${data.conversationId}`,
      });
      this.logger.log(`Client ${client.id} joined room ${roomName}`);
      client.emit(
        'joinedRoom',
        WebSocketSuccessResponseDto.of({ conversationId: data.conversationId }),
      );
    } catch (error) {
      this.logger.error('Failed to join room:', error);
      client.emit(
        'joinedRoom',
        WebSocketErrorResponseDto.of('Failed to join room', 'ROOM001'),
      );
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: JoinRoomRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const roomName = `conversation_${data.conversationId}`;
      client.leave(roomName);
      await this.chatService.updateUserStatus({
        socketId: client.id,
        status: 'chat_list',
      });
      this.logger.log(`Client ${client.id} left room ${roomName}`);
      client.emit(
        'leftRoom',
        WebSocketSuccessResponseDto.of({ conversationId: data.conversationId }),
      );
    } catch (error) {
      this.logger.error('Failed to leave room:', error);
      client.emit(
        'leftRoom',
        WebSocketErrorResponseDto.of('Failed to leave room', 'ROOM002'),
      );
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = await this.chatService.getUserIdBySocketId({
      socketId: client.id,
    });
    if (!userId) {
      client.emit(
        'messageSent',
        WebSocketErrorResponseDto.of('User not authenticated', 'AUTH002'),
      );
      return;
    }

    try {
      const result = await this.chatService.sendMessage({
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
      });

      // WebSocket 이벤트 전송 처리
      result.emissions.forEach((emission) => {
        this.emitToUser(emission.userId, emission.event, emission.data);
      });

      client.emit(
        'messageSent',
        WebSocketSuccessResponseDto.of(result.message),
      );
    } catch (error) {
      this.logger.error('Failed to send message:', error);
      client.emit(
        'messageSent',
        WebSocketErrorResponseDto.of('Failed to send message', 'MSG001'),
      );
    }
  }

  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(
    @MessageBody() data: MarkMessagesAsReadRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = await this.chatService.getUserIdBySocketId({
      socketId: client.id,
    });
    if (!userId) {
      client.emit(
        'messagesMarkedAsRead',
        WebSocketErrorResponseDto.of('User not authenticated', 'AUTH002'),
      );
      return;
    }

    try {
      const result = await this.chatService.markMessagesAsRead({
        userId,
        conversationId: data.conversationId,
        lastReadMessageNumber: data.lastReadMessageNumber,
      });

      // WebSocket 이벤트 전송 처리
      result.emissions.forEach((emission) => {
        this.emitToUser(emission.userId, emission.event, emission.data);
      });

      client.emit(
        'messagesMarkedAsRead',
        WebSocketSuccessResponseDto.of({
          conversationId: data.conversationId,
          lastReadMessageNumber: data.lastReadMessageNumber,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to mark messages as read:', error);
      client.emit(
        'messagesMarkedAsRead',
        WebSocketErrorResponseDto.of(
          'Failed to mark messages as read',
          'MSG002',
        ),
      );
    }
  }

  emitToUser(userId: number, event: string, data: any): void {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  emitToRoom(roomName: string, event: string, data: any): void {
    this.server.to(roomName).emit(event, data);
  }
}
