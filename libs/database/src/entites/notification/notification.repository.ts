import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationRepository extends EntityRepository<Notification> {
  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PagedResult<Notification>> {
    const [notifications, totalCount] = await this.findAndCount(
      {
        userId,
        isDeleted: false,
      },
      {
        orderBy: { createdAt: 'DESC' } as any,
        limit,
        offset: (page - 1) * limit,
      },
    );

    return {
      content: notifications,
      page,
      limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
    };
  }
}
