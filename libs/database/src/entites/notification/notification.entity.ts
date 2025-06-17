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
  private readonly id!: number;

  @Property()
  private userId!: number;

  @Property()
  private productId!: number;

  @Enum(() => NotificationProductStatus)
  private productStatus!: NotificationProductStatus;

  @Enum(() => NotificationType)
  private notificationType!: NotificationType;

  @Property()
  private content!: string;

  @Property()
  private isRead: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getUserId(): number {
    return this.userId;
  }

  public getProductId(): number {
    return this.productId;
  }

  public getProductStatus(): NotificationProductStatus {
    return this.productStatus;
  }

  public getNotificationType(): NotificationType {
    return this.notificationType;
  }

  public getContent(): string {
    return this.content;
  }

  public getIsRead(): boolean {
    return this.isRead;
  }
}
