export class GetNotificationsParamsDto {
  userId: number;

  page: number;

  limit: number;

  private constructor(userId: number, page: number, limit: number) {
    this.userId = userId;
    this.page = page;
    this.limit = limit;
  }

  static of(
    userId: number,
    page: number,
    limit: number,
  ): GetNotificationsParamsDto {
    return new GetNotificationsParamsDto(userId, page, limit);
  }
}
