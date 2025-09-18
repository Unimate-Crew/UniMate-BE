export abstract class BaseWebSocketResponseDto {
  isSuccess: boolean;

  requestId?: string;

  protected constructor(isSuccess: boolean, requestId?: string) {
    this.isSuccess = isSuccess;
    this.requestId = requestId;
  }
}
