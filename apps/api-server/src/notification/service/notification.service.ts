import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '@app/database/entites/notification/notification.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { User } from '@app/database';
import { ErrorCode } from '@app/common';
import { GetNotificationsParamsDto } from './dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from './dto/get-notifications-result.dto';
import { DeleteNotificationsParamsDto } from './dto/delete-notifications-params.dto';
import { DeleteNotificationsResultDto } from './dto/delete-notifications-result.dto';
import { GetNotificationSettingsResultDto } from './dto/get-notification-settings-result.dto';
import { UpdateNotificationSettingsResultDto } from './dto/update-notification-settings-result.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
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

  async getNotificationSettings(
    userId: number,
  ): Promise<GetNotificationSettingsResultDto> {
    const user: User = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    return GetNotificationSettingsResultDto.from(user);
  }

  async updateNotificationSettings(params: {
    userId: number;
    priceChangedNotificationEnabled?: boolean;
    saleEndedNotificationEnabled?: boolean;
  }): Promise<UpdateNotificationSettingsResultDto> {
    const user: User = await this.userRepository.findOne({ id: params.userId });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    user.updateNotificationSettings({
      priceChangedNotificationEnabled: params.priceChangedNotificationEnabled,
      saleEndedNotificationEnabled: params.saleEndedNotificationEnabled,
    });

    await this.userRepository.flush();
    return UpdateNotificationSettingsResultDto.from(user);
  }
}
