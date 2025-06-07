import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '@app/database/entites/notification/notification.repository';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getNotifications(
    userId: number,
    dto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    const pagedResult = await this.notificationRepository.findByUserId(
      userId,
      dto.page,
      dto.limit,
    );

    return GetNotificationsResponseDto.fromPagedResult(pagedResult);
  }
}
