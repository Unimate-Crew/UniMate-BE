import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@app/database/entites/notification/notification.repository';
import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { GetNotificationsParamsDto } from './dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from './dto/get-notifications-result.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotifications(
    params: GetNotificationsParamsDto,
  ): Promise<GetNotificationsResultDto> {
    const notifications: PagedResult<Notification> =
      await this.notificationRepository.findByUserId(
        params.userId,
        params.page,
        params.limit,
      );

    return GetNotificationsResultDto.fromPagedResult(notifications);
  }
}
