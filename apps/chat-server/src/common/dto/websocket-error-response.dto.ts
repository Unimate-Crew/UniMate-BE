import { BaseWebSocketResponseDto } from './base-websocket-response.dto';

export class WebSocketErrorResponseDto extends BaseWebSocketResponseDto {
  errorCode: string;

  errorMessage: string;

  constructor(errorMessage: string, errorCode: string, requestId?: string) {
    super(false, requestId);
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }

  static of(
    errorMessage: string,
    errorCode: string,
    requestId?: string,
  ): WebSocketErrorResponseDto {
    return new WebSocketErrorResponseDto(errorMessage, errorCode, requestId);
  }
}
