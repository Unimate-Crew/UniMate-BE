import { BaseWebSocketResponseDto } from './base-websocket-response.dto';

export class WebSocketSuccessResponseDto extends BaseWebSocketResponseDto {
  constructor(requestId?: string) {
    super(true, requestId);
  }

  static of(requestId?: string): WebSocketSuccessResponseDto {
    return new WebSocketSuccessResponseDto(requestId);
  }
}
