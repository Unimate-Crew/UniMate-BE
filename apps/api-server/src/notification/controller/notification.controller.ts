import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from '../service/notification.service';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTokenInfo } from '../../common/types/user-token-info';
import { GetUserTokenInfo } from '../../common/decorators/get-user-token-info.decorator';
import { GetNotificationsParamsDto } from '../service/dto/get-notifications-params.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Query() requestDto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    const params = GetNotificationsParamsDto.from(
      userTokenInfo.userId,
      requestDto.page,
      requestDto.limit,
    );

    const result = await this.notificationService.getNotifications(params);

    return GetNotificationsResponseDto.fromServiceResponse(result);
  }
}
