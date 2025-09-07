import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../application/chat.service';
import { SendMessageRequestDto } from './dto/send-message.request.dto';
import { MarkMessagesAsReadRequestDto } from './dto/mark-messages-as-read.request.dto';
import { AuthenticateTokenRequestDto } from './dto/authenticate-token.request.dto';
import { JoinRoomRequestDto } from './dto/join-room.request.dto';
import { WebSocketSuccessResponseDto } from './dto/websocket-response.dto';
import { WebSocketEventData } from '../application/dto/websocket-emission.result.dto';
import { WebSocketJwtGuard } from '../../common/guards/websocket-jwt.guard';
import {
  WsUser,
  WebSocketUser,
} from '../../common/decorators/websocket-user.decorator';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
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
    @MessageBody() data: AuthenticateTokenRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // JWT 토큰 수동 검증 (가드는 이벤트 핸들러에서만 작동하므로)
    const guard = new WebSocketJwtGuard(this.jwtService, this.configService);
    const mockContext = {
      switchToWs: () => ({
        getClient: () => client,
        getData: () => data,
      }),
    } as any;

    const isValid = guard.canActivate(mockContext);
    if (!isValid) {
      return;
    }

    const user = (client as any).user as WebSocketUser;

    await this.chatService.authenticateUser({
      userId: user.userId,
      socketId: client.id,
    });

    // 사용자별 방에 조인하여 인스턴스 간 메시지 전송 가능하게 함
    client.join(`user_${user.userId}`);

    client.emit(
      'authenticated',
      WebSocketSuccessResponseDto.of({
        message: 'Authentication successful',
      }),
    );
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomRequestDto,
    @WsUser() user: WebSocketUser,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomName = `conversation_${data.conversationId}`;
    client.join(roomName);

    // Redis에 온라인 사용자 추가
    await this.chatService.addUserToOnlineRoom({
      conversationId: data.conversationId,
      userId: user.userId,
    });

    this.logger.log(`Client ${client.id} joined room ${roomName}`);
    client.emit(
      'joinedRoom',
      WebSocketSuccessResponseDto.of({ conversationId: data.conversationId }),
    );
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: JoinRoomRequestDto,
    @WsUser() user: WebSocketUser,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const roomName = `conversation_${data.conversationId}`;
    client.leave(roomName);

    // Redis에서 온라인 사용자 제거
    await this.chatService.removeUserFromOnlineRoom({
      conversationId: data.conversationId,
      userId: user.userId,
    });

    this.logger.log(`Client ${client.id} left room ${roomName}`);
    client.emit(
      'leftRoom',
      WebSocketSuccessResponseDto.of({ conversationId: data.conversationId }),
    );
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageRequestDto,
    @WsUser() user: WebSocketUser,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const result = await this.chatService.sendMessage({
      conversationId: data.conversationId,
      senderId: user.userId,
      content: data.content,
    });

    // WebSocket 이벤트 전송 처리
    result.emissions.forEach((emission) => {
      this.emitToUser(emission.userId, emission.event, emission.data);
    });

    client.emit('messageSent', WebSocketSuccessResponseDto.of(result.message));
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(
    @MessageBody() data: MarkMessagesAsReadRequestDto,
    @WsUser() user: WebSocketUser,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const result = await this.chatService.markMessagesAsRead({
      userId: user.userId,
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
  }

  emitToUser(userId: number, event: string, data: WebSocketEventData): void {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}
