import { EntityRepository, QueryOrder } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { createPagedResult, PagedResult } from '@app/common/utils/pagination';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationRepository extends EntityRepository<Notification> {
  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PagedResult<Notification>> {
    const notifications = await this.find(
      {
        userId,
        isDeleted: false,
      },
      {
        limit: limit + 1,
        offset: (page - 1) * limit,
        orderBy: { createdAt: QueryOrder.DESC },
      },
    );

    return createPagedResult(notifications, limit);
  }

  async deleteNotifications(
    userId: number,
    notificationIds: number[],
  ): Promise<number> {
    const result = await this.nativeUpdate(
      {
        id: { $in: notificationIds },
        userId,
        isDeleted: false,
      },
      { isDeleted: true },
    );

    return result;
  }

  async deleteAllNotifications(userId: number): Promise<number> {
    const result = await this.nativeUpdate(
      {
        userId,
        isDeleted: false,
      },
      { isDeleted: true },
    );

    return result;
  }
}
