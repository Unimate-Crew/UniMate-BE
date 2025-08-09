export class DeleteNotificationsResultDto {
  private constructor(public readonly deletedCount: number) {}

  static of(deletedCount: number): DeleteNotificationsResultDto {
    return new DeleteNotificationsResultDto(deletedCount);
  }
}
