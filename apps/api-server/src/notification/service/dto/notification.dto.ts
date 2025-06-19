import { Notification } from '@app/database/entites/notification/notification.entity';
import {
  NotificationProductStatus,
  NotificationType,
} from '@app/database/common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ description: '알림 ID' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ApiProperty({ description: '상품 ID' })
  productId: number;

  @ApiProperty({ description: '상품 상태', enum: NotificationProductStatus })
  productStatus: NotificationProductStatus;

  @ApiProperty({ description: '알림 유형', enum: NotificationType })
  notificationType: NotificationType;

  @ApiProperty({ description: '알림 내용' })
  content: string;

  @ApiProperty({ description: '읽음 여부' })
  isRead: boolean;

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;

  private constructor(
    id: number,
    userId: number,
    productId: number,
    productStatus: NotificationProductStatus,
    notificationType: NotificationType,
    content: string,
    isRead: boolean,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.productId = productId;
    this.productStatus = productStatus;
    this.notificationType = notificationType;
    this.content = content;
    this.isRead = isRead;
    this.createdAt = createdAt;
  }

  static fromEntity(notification: Notification): NotificationDto {
    return new NotificationDto(
      notification.id,
      notification.userId,
      notification.productId,
      notification.productStatus,
      notification.notificationType,
      notification.content,
      notification.isRead,
      notification.createdAt,
    );
  }
}
