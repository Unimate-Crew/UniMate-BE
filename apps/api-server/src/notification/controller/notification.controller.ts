import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTokenInfo } from '../../common/types/user-token-info';
import { GetUserTokenInfo } from '../../common/decorators/get-user-token-info.decorator';
import { GetNotificationsParamsDto } from '../service/dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from '../service/dto/get-notifications-result.dto';

@ApiTags('알림')
@ApiBearerAuth('accessToken')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: '알림 목록 조회',
    description: '사용자의 알림 목록을 페이지네이션과 함께 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 목록 조회 성공',
    type: GetNotificationsResponseDto,
  })
  async getNotifications(
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
    @Query() requestDto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    const params: GetNotificationsParamsDto = GetNotificationsParamsDto.of(
      userTokenInfo.userId,
      requestDto.page,
      requestDto.limit,
    );
    const result: GetNotificationsResultDto =
      await this.notificationService.getNotifications(params);

    return GetNotificationsResponseDto.fromResult(result);
  }
}
