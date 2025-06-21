import {
  Controller,
  Get,
  Query,
  UseGuards,
  Delete,
  Body,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from '../service/notification.service';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { GetNotificationsResponseDto } from './dto/get-notifications-response.dto';
import { DeleteNotificationsRequestDto } from './dto/delete-notifications-request.dto';
import { DeleteNotificationsResponseDto } from './dto/delete-notifications-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserTokenInfo } from '../../common/types/user-token-info';
import { GetUserTokenInfo } from '../../common/decorators/get-user-token-info.decorator';
import { GetNotificationsParamsDto } from '../service/dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from '../service/dto/get-notifications-result.dto';
import { DeleteNotificationsParamsDto } from '../service/dto/delete-notifications-params.dto';
import { DeleteNotificationsResultDto } from '../service/dto/delete-notifications-result.dto';

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
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
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
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
  ): Promise<DeleteNotificationsResponseDto> {
    const result: DeleteNotificationsResultDto =
      await this.notificationService.deleteAllNotifications(
        userTokenInfo.userId,
      );

    return DeleteNotificationsResponseDto.fromResult(result);
  }
}
