export class CheckSendPermissionResultDto {
  canSendMessage: boolean;

  private constructor(canSendMessage: boolean) {
    this.canSendMessage = canSendMessage;
  }

  static of(canSendMessage: boolean): CheckSendPermissionResultDto {
    return new CheckSendPermissionResultDto(canSendMessage);
  }
}
