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

  static from(notification: Notification): NotificationDto {
    const dto = new NotificationDto();
    dto.id = notification.getId();
    dto.userId = notification.getUserId();
    dto.productId = notification.getProductId();
    dto.productStatus = notification.getProductStatus();
    dto.notificationType = notification.getNotificationType();
    dto.content = notification.getContent();
    dto.isRead = notification.getIsRead();
    dto.createdAt = notification.getCreatedAt();
    return dto;
  }
}
