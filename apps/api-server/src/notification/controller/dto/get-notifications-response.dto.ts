import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto } from '../../service/dto/notification.dto';
import { GetNotificationsResultDto } from '../../service/dto/get-notifications-result.dto';

export class GetNotificationsResponseDto {
  @ApiProperty({ description: '알림 목록', type: [NotificationDto] })
  contents: NotificationDto[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  private constructor(contents: NotificationDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static fromResult(
    result: GetNotificationsResultDto,
  ): GetNotificationsResponseDto {
    return new GetNotificationsResponseDto(result.items, result.hasNext);
  }
}
