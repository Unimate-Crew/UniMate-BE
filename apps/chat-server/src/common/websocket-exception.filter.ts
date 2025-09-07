import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketErrorResponseDto } from '../chat/api/dto/websocket-response.dto';
import {
  WebSocketErrorCode,
  WebSocketErrorMessage,
} from './websocket-error-codes';

@Catch()
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();

    let errorCode: string;
    let errorMessage: string;

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        errorCode = WebSocketErrorCode.INTERNAL_ERROR;
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        errorCode = (error as any).code || WebSocketErrorCode.INTERNAL_ERROR;
        errorMessage =
          (error as any).message || WebSocketErrorMessage[errorCode];
      } else {
        errorCode = WebSocketErrorCode.INTERNAL_ERROR;
        errorMessage = WebSocketErrorMessage[WebSocketErrorCode.INTERNAL_ERROR];
      }
    } else if (exception.message?.includes('not found')) {
      errorCode = WebSocketErrorCode.VALIDATION_ERROR;
      errorMessage = exception.message;
    } else if (exception.message?.includes('not authenticated')) {
      errorCode = WebSocketErrorCode.AUTH002;
      errorMessage = WebSocketErrorMessage[WebSocketErrorCode.AUTH002];
    } else {
      errorCode = WebSocketErrorCode.INTERNAL_ERROR;
      errorMessage = WebSocketErrorMessage[WebSocketErrorCode.INTERNAL_ERROR];

      // 예상하지 못한 에러는 로그에 기록
      this.logger.error('Unexpected WebSocket error:', {
        error: exception.message,
        stack: exception.stack,
        data,
        socketId: client.id,
      });
    }

    // 마지막으로 호출된 이벤트명 추출 (응답 이벤트명 결정용)
    const eventMap: Record<string, string> = {
      authenticate: 'authenticated',
      joinRoom: 'joinedRoom',
      leaveRoom: 'leftRoom',
      sendMessage: 'messageSent',
      markMessagesAsRead: 'messagesMarkedAsRead',
    };

    // 기본적으로 'error' 이벤트로 응답하되, 특정 이벤트에 대한 응답이면 해당 이벤트로 응답
    const lastEvent = this.getLastEventFromStack(exception.stack);
    const responseEvent = eventMap[lastEvent] || 'error';

    client.emit(
      responseEvent,
      WebSocketErrorResponseDto.of(errorMessage, errorCode),
    );
  }

  private getLastEventFromStack(stack?: string): string {
    if (!stack) return '';

    // 스택에서 handle로 시작하는 메서드명 찾기 (handleAuthenticate, handleJoinRoom 등)
    const handleMethods = [
      'handleAuthenticate',
      'handleJoinRoom',
      'handleLeaveRoom',
      'handleSendMessage',
      'handleMarkMessagesAsRead',
    ];

    for (let i = 0; i < handleMethods.length; i++) {
      if (stack.includes(handleMethods[i])) {
        // handleAuthenticate -> authenticate
        return handleMethods[i]
          .replace('handle', '')
          .replace(/^./, (str) => str.toLowerCase());
      }
    }

    return '';
  }
}
