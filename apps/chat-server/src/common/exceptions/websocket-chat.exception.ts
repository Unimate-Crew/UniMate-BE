import { WsException } from '@nestjs/websockets';
import {
  WebSocketErrorCode,
  WebSocketErrorMessage,
} from '../websocket-error-codes';

/**
 * 채팅 관련 WebSocket 예외를 위한 커스텀 예외 클래스
 * 에러 코드를 인스턴스 필드로 가지고 있어 예외 핸들러에서 구분 가능
 */
export class WebSocketChatException extends WsException {
  constructor(
    public readonly errorCode: WebSocketErrorCode,
    message?: string,
    public readonly requestId?: string,
  ) {
    super({
      code: errorCode,
      message: message || WebSocketErrorMessage[errorCode],
      requestId,
    });
  }

  /**
   * 에러 코드와 기본 메시지로 예외를 생성하는 정적 메서드
   */
  static withCode(
    errorCode: WebSocketErrorCode,
    requestId?: string,
  ): WebSocketChatException {
    return new WebSocketChatException(errorCode, undefined, requestId);
  }

  /**
   * 에러 코드와 커스텀 메시지로 예외를 생성하는 정적 메서드
   */
  static withMessage(
    errorCode: WebSocketErrorCode,
    message: string,
    requestId?: string,
  ): WebSocketChatException {
    return new WebSocketChatException(errorCode, message, requestId);
  }
}
