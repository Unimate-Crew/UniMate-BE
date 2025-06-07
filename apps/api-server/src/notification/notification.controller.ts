import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserTokenInfo } from '../common/types/user-token-info';
import { GetUserTokenInfo } from '../common/decorators/get-user-token-info.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Query() dto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    return this.notificationService.getNotifications(userTokenInfo.userId, dto);
  }
}
