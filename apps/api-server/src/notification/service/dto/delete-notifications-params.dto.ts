export class DeleteNotificationsParamsDto {
  private constructor(
    public readonly userId: number,
    public readonly notificationIds: number[],
  ) {}

  static of(
    userId: number,
    notificationIds: number[],
  ): DeleteNotificationsParamsDto {
    return new DeleteNotificationsParamsDto(userId, notificationIds);
  }
}
