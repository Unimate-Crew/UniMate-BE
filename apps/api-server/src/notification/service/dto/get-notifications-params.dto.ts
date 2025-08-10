export class GetNotificationsParamsDto {
  userId: number;

  pageNumber: number;

  pageSize: number;

  private constructor(userId: number, pageNumber: number, pageSize: number) {
    this.userId = userId;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }

  static of(
    userId: number,
    pageNumber: number,
    pageSize: number,
  ): GetNotificationsParamsDto {
    return new GetNotificationsParamsDto(userId, pageNumber, pageSize);
  }
}
