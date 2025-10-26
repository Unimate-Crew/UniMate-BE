import {
  Controller,
  Get,
  Query,
  UseGuards,
  Delete,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { NotificationService } from '../service/notification.service';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { DeleteNotificationsRequestDto } from './dto/delete-notifications-request.dto';
import { DeleteNotificationsResponseDto } from './dto/delete-notifications-response.dto';
import { GetNotificationSettingsResponseDto } from './dto/get-notification-settings-response.dto';
import { UpdateNotificationSettingsRequestDto } from './dto/update-notification-settings-request.dto';
import { UpdateNotificationSettingsResponseDto } from './dto/update-notification-settings-response.dto';
import { GetNotificationsParamsDto } from '../service/dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from '../service/dto/get-notifications-result.dto';
import { DeleteNotificationsParamsDto } from '../service/dto/delete-notifications-params.dto';
import { DeleteNotificationsResultDto } from '../service/dto/delete-notifications-result.dto';
import { GetNotificationSettingsResultDto } from '../service/dto/get-notification-settings-result.dto';
import { UpdateNotificationSettingsResultDto } from '../service/dto/update-notification-settings-result.dto';

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
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Query() requestDto: GetNotificationsRequestDto,
  ): Promise<GetNotificationsResponseDto> {
    const params: GetNotificationsParamsDto = GetNotificationsParamsDto.of(
      userTokenInfo.userId,
      requestDto.pageNumber,
      requestDto.pageSize,
    );
    const result: GetNotificationsResultDto =
      await this.notificationService.getNotifications(params);

    return GetNotificationsResponseDto.fromResult(result);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '알림 읽음 처리 성공',
  })
  @ApiResponse({
    status: 404,
    description: '알림을 찾을 수 없음',
  })
  async markNotificationAsRead(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Param('id', ParseIntPipe) notificationId: number,
  ): Promise<void> {
    await this.notificationService.markNotificationAsRead({
      userId: userTokenInfo.userId,
      notificationId,
    });
  }

  @Delete()
  @ApiOperation({
    summary: '알림 삭제',
    description: '여러 알림을 한 번에 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 삭제 성공',
    type: DeleteNotificationsResponseDto,
  })
  async deleteNotifications(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: DeleteNotificationsRequestDto,
  ): Promise<DeleteNotificationsResponseDto> {
    const params: DeleteNotificationsParamsDto =
      DeleteNotificationsParamsDto.of(
        userTokenInfo.userId,
        requestDto.notificationIds,
      );

    const result: DeleteNotificationsResultDto =
      await this.notificationService.deleteNotifications(params);

    return DeleteNotificationsResponseDto.fromResult(result);
  }

  @Delete('all')
  @ApiOperation({
    summary: '전체 알림 삭제',
    description: '사용자의 모든 알림을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '전체 알림 삭제 성공',
    type: DeleteNotificationsResponseDto,
  })
  async deleteAllNotifications(
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<DeleteNotificationsResponseDto> {
    const result: DeleteNotificationsResultDto =
      await this.notificationService.deleteAllNotifications(
        userTokenInfo.userId,
      );

    return DeleteNotificationsResponseDto.fromResult(result);
  }

  @Get('settings')
  @ApiOperation({
    summary: '알림 설정 조회',
    description: '사용자의 알림 설정을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 설정 조회 성공',
    type: GetNotificationSettingsResponseDto,
  })
  async getNotificationSettings(
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetNotificationSettingsResponseDto> {
    const result: GetNotificationSettingsResultDto =
      await this.notificationService.getNotificationSettings(
        userTokenInfo.userId,
      );

    return GetNotificationSettingsResponseDto.from(result);
  }

  @Patch('settings')
  @ApiOperation({
    summary: '알림 설정 업데이트',
    description: '사용자의 알림 설정을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알림 설정 업데이트 성공',
    type: UpdateNotificationSettingsResponseDto,
  })
  async updateNotificationSettings(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: UpdateNotificationSettingsRequestDto,
  ): Promise<UpdateNotificationSettingsResponseDto> {
    const { priceChangedNotificationEnabled, saleEndedNotificationEnabled } =
      requestDto;

    const result: UpdateNotificationSettingsResultDto =
      await this.notificationService.updateNotificationSettings({
        userId: userTokenInfo.userId,
        priceChangedNotificationEnabled,
        saleEndedNotificationEnabled,
      });

    return UpdateNotificationSettingsResponseDto.from(result);
  }
}
