export class WebSocketSuccessResponseDto<T = any> {
  success: boolean = true;

  data: T;

  constructor(data: T) {
    this.data = data;
  }

  static of<T>(data: T): WebSocketSuccessResponseDto<T> {
    return new WebSocketSuccessResponseDto(data);
  }
}

export class WebSocketErrorResponseDto {
  success: boolean = false;

  error: {
    code?: string;
    message: string;
  };

  constructor(message: string, code?: string) {
    this.error = {
      code,
      message,
    };
  }

  static of(message: string, code?: string): WebSocketErrorResponseDto {
    return new WebSocketErrorResponseDto(message, code);
  }
}
