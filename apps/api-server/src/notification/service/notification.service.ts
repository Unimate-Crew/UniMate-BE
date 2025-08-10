import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@app/database/entites/notification/notification.repository';
import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { GetNotificationsParamsDto } from './dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from './dto/get-notifications-result.dto';
import { DeleteNotificationsParamsDto } from './dto/delete-notifications-params.dto';
import { DeleteNotificationsResultDto } from './dto/delete-notifications-result.dto';

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
        params.pageNumber,
        params.pageSize,
      );

    return GetNotificationsResultDto.fromPagedResult(notifications);
  }

  async deleteNotifications(
    params: DeleteNotificationsParamsDto,
  ): Promise<DeleteNotificationsResultDto> {
    const deletedCount = await this.notificationRepository.deleteNotifications(
      params.userId,
      params.notificationIds,
    );

    return DeleteNotificationsResultDto.of(deletedCount);
  }

  async deleteAllNotifications(
    userId: number,
  ): Promise<DeleteNotificationsResultDto> {
    const deletedCount =
      await this.notificationRepository.deleteAllNotifications(userId);

    return DeleteNotificationsResultDto.of(deletedCount);
  }
}
