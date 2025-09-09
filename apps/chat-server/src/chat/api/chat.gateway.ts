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
import { Injectable, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { ChatService } from '../application/chat.service';
import { SendMessageRequestDto } from './dto/send-message.request.dto';
import { MarkMessagesAsReadRequestDto } from './dto/mark-messages-as-read.request.dto';
import { JoinRoomRequestDto } from './dto/join-room.request.dto';
import {
  MessageEmissionResultDto,
  ReadEmissionResultDto,
} from '../application/dto/websocket-emission.result.dto';
import { WebSocketJwtGuard } from '../../common/guards/websocket-jwt.guard';
import {
  WsUser,
  WebSocketUser,
} from '../../common/decorators/websocket-user.decorator';
import { WebSocketAuthMiddleware } from '../../common/middleware/websocket-auth.middleware';
import { WebSocketSuccessResponseInterceptor } from '../../common/interceptors/websocket-success-response.interceptor';

@Injectable()
@UseInterceptors(WebSocketSuccessResponseInterceptor)
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
    private readonly authMiddleware: WebSocketAuthMiddleware,
  ) {}

  afterInit(server: Server): void {
    // Set up authentication middleware for all connections
    server.use(this.authMiddleware.createMiddleware());
    this.logger.log('WebSocket authentication middleware configured');
  }

  async handleConnection(client: Socket): Promise<void> {
    // User is already authenticated at this point via middleware
    const user = (client as any).user as WebSocketUser;

    await this.chatService.registerUserSession({
      userId: user.userId,
      socketId: client.id,
    });

    // Join user-specific room for cross-instance messaging
    client.join(`user_${user.userId}`);

    this.logger.log(`User ${user.userId} connected with socket ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);

    // 사용자 ID 조회 후 사용자별 방에서 나가기
    const userId: number | null = await this.chatService.getUserIdBySocketId({
      socketId: client.id,
    });
    if (userId) {
      client.leave(`user_${userId}`);
    }

    await this.chatService.handleUserDisconnect({ socketId: client.id });
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
    await this.chatService.addUserToOnlineConversation({
      conversationId: data.conversationId,
      userId: user.userId,
    });

    this.logger.log(`Client ${client.id} joined room ${roomName}`);
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
    await this.chatService.removeUserFromOnlineConversation({
      conversationId: data.conversationId,
      userId: user.userId,
    });

    this.logger.log(`Client ${client.id} left room ${roomName}`);
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageRequestDto,
    @WsUser() user: WebSocketUser,
  ): Promise<void> {
    const result: MessageEmissionResultDto = await this.chatService.sendMessage(
      {
        conversationId: data.conversationId,
        senderId: user.userId,
        content: data.content,
      },
    );

    // WebSocket 이벤트 전송 처리
    result.emissions.forEach((emission) => {
      this.server
        .to(`user_${emission.userId}`)
        .emit(emission.event, emission.data);
    });
  }

  @UseGuards(WebSocketJwtGuard)
  @SubscribeMessage('markMessagesAsRead')
  async handleMarkMessagesAsRead(
    @MessageBody() data: MarkMessagesAsReadRequestDto,
    @WsUser() user: WebSocketUser,
  ): Promise<void> {
    const result: ReadEmissionResultDto =
      await this.chatService.markMessagesAsRead({
        userId: user.userId,
        conversationId: data.conversationId,
        lastReadMessageNumber: data.lastReadMessageNumber,
      });

    // WebSocket 이벤트 전송 처리
    result.emissions.forEach((emission) => {
      this.server
        .to(`user_${emission.userId}`)
        .emit(emission.event, emission.data);
    });
  }
}
