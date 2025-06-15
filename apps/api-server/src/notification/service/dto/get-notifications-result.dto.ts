import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { NotificationDto } from './notification.dto';

export class GetNotificationsResultDto {
  items: NotificationDto[];

  hasNext: boolean;

  private constructor(items: NotificationDto[], hasNext: boolean) {
    this.items = items;
    this.hasNext = hasNext;
  }

  static fromPagedResult(
    pagedResult: PagedResult<Notification>,
  ): GetNotificationsResultDto {
    return new GetNotificationsResultDto(
      pagedResult.items.map((notification) =>
        NotificationDto.from(notification),
      ),
      pagedResult.hasNext,
    );
  }
}
