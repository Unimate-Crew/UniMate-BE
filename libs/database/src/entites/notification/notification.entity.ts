import { Entity, Property, PrimaryKey, Enum } from '@mikro-orm/core';
import {
  NotificationType,
  NotificationProductStatus,
} from '@app/database/common/enums';
import { BaseEntity } from '../../common/base.entity';
import { NotificationRepository } from './notification.repository';

@Entity({ repository: () => NotificationRepository })
export class Notification extends BaseEntity {
  @PrimaryKey()
  readonly id!: number;

  @Property()
  readonly userId!: number;

  @Property()
  readonly productId!: number;

  @Enum(() => NotificationProductStatus)
  productStatus!: NotificationProductStatus;

  @Enum(() => NotificationType)
  notificationType!: NotificationType;

  @Property()
  content!: string;

  @Property()
  isRead: boolean = false;
}
