import { PagedResult } from '@app/common/utils/pagination';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { NotificationDto } from './notification.dto';

export class GetNotificationsResponseDto {
  @ApiProperty({ description: '알림 목록', type: [NotificationDto] })
  content: NotificationDto[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  static fromPagedResult(
    pagedResult: PagedResult<Notification>,
  ): GetNotificationsResponseDto {
    const response = new GetNotificationsResponseDto();
    response.content = pagedResult.content.map((notification) =>
      NotificationDto.from(notification),
    );
    response.hasNext = pagedResult.hasNext;
    return response;
  }
}
