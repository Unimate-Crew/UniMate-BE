import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Socket } from 'socket.io';
import { WebSocketSuccessResponseDto } from '../../chat/api/dto/websocket-response.dto';

@Injectable()
export class WebSocketSuccessResponseInterceptor implements NestInterceptor {
  private readonly eventMapping: Record<string, string> = {
    handleJoinRoom: 'joinedRoom',
    handleLeaveRoom: 'leftRoom',
    handleSendMessage: 'messageSent',
    handleMarkMessagesAsRead: 'messagesMarkedAsRead',
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextType = context.getType();

    if (contextType !== 'ws') {
      return next.handle();
    }

    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    const handler = context.getHandler();
    const handlerName = handler.name;

    // 응답 이벤트명 결정
    const responseEvent = this.eventMapping[handlerName];

    if (!responseEvent) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // 간소화된 성공 응답 생성
        const requestId = data?.requestId;

        const successResponse = {
          success: true,
          ...(requestId && { requestId }),
        };

        client.emit(responseEvent, successResponse);
      }),
    );
  }
}
