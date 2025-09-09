import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketErrorResponseDto } from './dto';
import {
  WebSocketErrorCode,
  WebSocketErrorMessage,
} from './websocket-error-codes';
import { WebSocketChatException } from './exceptions/websocket-chat.exception';

@Catch()
export class WebSocketExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WebSocketExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();
    const requestId = data?.requestId;

    const { errorCode, errorMessage } = this.extractErrorInfo(
      exception,
      data,
      client,
    );
    const responseEvent = this.determineResponseEvent(exception.stack);

    client.emit(
      responseEvent,
      WebSocketErrorResponseDto.of(errorMessage, errorCode, requestId),
    );
  }

  private extractErrorInfo(
    exception: any,
    data: any,
    client: Socket,
  ): { errorCode: string; errorMessage: string } {
    if (exception instanceof WebSocketChatException) {
      return this.handleChatException(exception);
    }

    if (exception instanceof WsException) {
      return this.handleWsException(exception);
    }

    return this.handleGenericException(exception, data, client);
  }

  private handleChatException(exception: WebSocketChatException): {
    errorCode: string;
    errorMessage: string;
  } {
    const { errorCode } = exception;
    const error = exception.getError();
    const errorMessage =
      (typeof error === 'object' && error !== null && 'message' in error
        ? (error as any).message
        : WebSocketErrorMessage[errorCode]) || WebSocketErrorMessage[errorCode];

    return { errorCode, errorMessage };
  }

  private handleWsException(exception: WsException): {
    errorCode: string;
    errorMessage: string;
  } {
    const error = exception.getError();

    if (typeof error === 'string') {
      return {
        errorCode: WebSocketErrorCode.INTERNAL_ERROR,
        errorMessage: error,
      };
    }

    if (typeof error === 'object' && error !== null) {
      return {
        errorCode: (error as any).code || WebSocketErrorCode.INTERNAL_ERROR,
        errorMessage:
          (error as any).message ||
          WebSocketErrorMessage[
            (error as any).code || WebSocketErrorCode.INTERNAL_ERROR
          ],
      };
    }

    return {
      errorCode: WebSocketErrorCode.INTERNAL_ERROR,
      errorMessage: WebSocketErrorMessage[WebSocketErrorCode.INTERNAL_ERROR],
    };
  }

  private handleGenericException(
    exception: any,
    data: any,
    client: Socket,
  ): { errorCode: string; errorMessage: string } {
    this.logger.error('Unexpected WebSocket error:', {
      error: exception.message,
      stack: exception.stack,
      data,
      socketId: client.id,
    });

    return {
      errorCode: WebSocketErrorCode.INTERNAL_ERROR,
      errorMessage: WebSocketErrorMessage[WebSocketErrorCode.INTERNAL_ERROR],
    };
  }

  private determineResponseEvent(stack?: string): string {
    const eventMap: Record<string, string> = {
      authenticate: 'authenticated',
      joinRoom: 'joinedRoom',
      leaveRoom: 'leftRoom',
      sendMessage: 'messageSent',
      markMessagesAsRead: 'messagesMarkedAsRead',
    };

    const lastEvent = this.extractEventFromStack(stack);
    return eventMap[lastEvent] || 'error';
  }

  private extractEventFromStack(stack?: string): string {
    if (!stack) return '';

    const handleMethods = [
      'handleAuthenticate',
      'handleJoinRoom',
      'handleLeaveRoom',
      'handleSendMessage',
      'handleMarkMessagesAsRead',
    ];

    const foundMethod = handleMethods.find((method) => stack.includes(method));
    return foundMethod
      ? foundMethod
          .replace('handle', '')
          .replace(/^./, (str) => str.toLowerCase())
      : '';
  }
}
