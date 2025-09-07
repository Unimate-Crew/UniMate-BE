export class WebSocketSuccessResponseDto<T = any> {
  success: boolean = true;

  data: T;

  requestId?: string;

  constructor(data: T, requestId?: string) {
    this.data = data;
    this.requestId = requestId;
  }

  static of<T>(data: T, requestId?: string): WebSocketSuccessResponseDto<T> {
    return new WebSocketSuccessResponseDto(data, requestId);
  }
}

export class WebSocketErrorResponseDto {
  success: boolean = false;

  errorCode: string;

  errorMessage: string;

  requestId?: string;

  constructor(errorMessage: string, errorCode: string, requestId?: string) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.requestId = requestId;
  }

  static of(
    errorMessage: string,
    errorCode: string,
    requestId?: string,
  ): WebSocketErrorResponseDto {
    return new WebSocketErrorResponseDto(errorMessage, errorCode, requestId);
  }
}
