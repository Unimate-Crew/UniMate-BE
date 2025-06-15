import { IsNumber, Min } from 'class-validator';

export class GetNotificationsParamsDto {
  @IsNumber()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(1)
  page: number;

  @IsNumber()
  @Min(1)
  limit: number;

  static from(
    userId: number,
    page: number,
    limit: number,
  ): GetNotificationsParamsDto {
    const dto = new GetNotificationsParamsDto();
    dto.userId = userId;
    dto.page = page;
    dto.limit = limit;
    return dto;
  }
}
