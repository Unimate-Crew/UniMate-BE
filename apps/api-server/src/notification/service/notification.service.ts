import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from '@app/database/entites/notification/notification.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { LikeRepository } from '@app/database/entites/like/like.repository';
import { ConversationParticipantRepository } from '@app/database/entites/conversation-participant/conversation-participant.repository';
import { DeviceRepository } from '@app/database/entites/device/device.repository';
import { PagedResult } from '@app/common/utils/pagination';
import { Notification } from '@app/database/entites/notification/notification.entity';
import { User } from '@app/database';
import { ErrorCode } from '@app/common';
import { SqsClient } from '@app/common/sqs/sqs.client';
import {
  NotificationType,
  NotificationProductStatus,
} from '@app/database/common/enums';
import { GetNotificationsParamsDto } from './dto/get-notifications-params.dto';
import { GetNotificationsResultDto } from './dto/get-notifications-result.dto';
import { DeleteNotificationsParamsDto } from './dto/delete-notifications-params.dto';
import { DeleteNotificationsResultDto } from './dto/delete-notifications-result.dto';
import { GetNotificationSettingsResultDto } from './dto/get-notification-settings-result.dto';
import { UpdateNotificationSettingsResultDto } from './dto/update-notification-settings-result.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
    private readonly conversationParticipantRepository: ConversationParticipantRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly sqsClient: SqsClient,
    private readonly configService: ConfigService,
  ) {}

  async getNotifications(
    params: GetNotificationsParamsDto,
  ): Promise<GetNotificationsResultDto> {
    const notifications: PagedResult<Notification> =
      await this.notificationRepository.findByUserId(
        params.userId,
        params.pageNumber,
        params.pageSize,
      );

    return GetNotificationsResultDto.fromPagedResult(notifications);
  }

  async deleteNotifications(
    params: DeleteNotificationsParamsDto,
  ): Promise<DeleteNotificationsResultDto> {
    const deletedCount = await this.notificationRepository.deleteNotifications(
      params.userId,
      params.notificationIds,
    );

    return DeleteNotificationsResultDto.of(deletedCount);
  }

  async deleteAllNotifications(
    userId: number,
  ): Promise<DeleteNotificationsResultDto> {
    const deletedCount =
      await this.notificationRepository.deleteAllNotifications(userId);

    return DeleteNotificationsResultDto.of(deletedCount);
  }

  async markNotificationAsRead(params: {
    userId: number;
    notificationId: number;
  }): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      id: params.notificationId,
      isDeleted: false,
    });

    if (!notification || notification.userId !== params.userId) {
      throw new NotFoundException({
        code: ErrorCode.NOTIFICATION_NOT_FOUND,
        message: '알림을 찾을 수 없습니다.',
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationRepository.flush();
    }
  }

  async getNotificationSettings(
    userId: number,
  ): Promise<GetNotificationSettingsResultDto> {
    const user: User = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    return GetNotificationSettingsResultDto.from(user);
  }

  async updateNotificationSettings(params: {
    userId: number;
    priceChangedNotificationEnabled?: boolean;
    saleEndedNotificationEnabled?: boolean;
  }): Promise<UpdateNotificationSettingsResultDto> {
    const user: User = await this.userRepository.findOne({ id: params.userId });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    user.updateNotificationSettings({
      priceChangedNotificationEnabled: params.priceChangedNotificationEnabled,
      saleEndedNotificationEnabled: params.saleEndedNotificationEnabled,
    });

    await this.userRepository.flush();
    return UpdateNotificationSettingsResultDto.from(user);
  }

  /**
   * 판매 종료 알림 생성 및 전송
   * 상품을 찜한 유저 및 채팅한 유저에게 알림을 발송합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.sellerId 판매자 ID (알림 대상에서 제외)
   * @param params.productTitle 상품 제목
   */
  async notifySaleEnded(params: {
    productPostId: number;
    sellerId: number;
    productTitle: string;
  }): Promise<void> {
    await this.notifyProductPostUpdate({
      productPostId: params.productPostId,
      sellerId: params.sellerId,
      productTitle: params.productTitle,
      notificationType: NotificationType.SALE_ENDED,
      notificationContent: `'${params.productTitle}'의 판매가 종료되었어요.`,
      pushTitle: `'${params.productTitle}'의 판매가 종료되었어요.`,
      pushBody: '다른 상품도 둘러볼까요?',
      isEnabledCheck: (user) => user.isSaleEndedNotificationEnabled(),
    });
  }

  /**
   * 가격 변동 알림 생성 및 전송
   * 상품을 찜한 유저 및 채팅한 유저에게 알림을 발송합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.sellerId 판매자 ID (알림 대상에서 제외)
   * @param params.productTitle 상품 제목
   */
  async notifyPriceChanged(params: {
    productPostId: number;
    sellerId: number;
    productTitle: string;
  }): Promise<void> {
    await this.notifyProductPostUpdate({
      productPostId: params.productPostId,
      sellerId: params.sellerId,
      productTitle: params.productTitle,
      notificationType: NotificationType.PRICE_CHANGED,
      notificationContent: `'${params.productTitle}'의 가격이 변동됐어요!`,
      pushTitle: `'${params.productTitle}'의 가격이 변동됐어요!`,
      pushBody: '지금 바로 확인해보세요!',
      isEnabledCheck: (user) => user.isPriceChangedNotificationEnabled(),
    });
  }

  /**
   * 상품 게시글 업데이트 알림을 배치로 생성 및 전송합니다.
   * 판매 종료 알림과 가격 변동 알림의 공통 로직을 처리합니다.
   */
  private async notifyProductPostUpdate(params: {
    productPostId: number;
    sellerId: number;
    productTitle: string;
    notificationType: NotificationType;
    notificationContent: string;
    pushTitle: string;
    pushBody: string;
    isEnabledCheck: (user: User) => boolean;
  }): Promise<void> {
    // 1. 알림 대상 조회 (찜한 유저 + 채팅한 유저)
    const likedUserIds = await this.likeRepository.findUserIdsByProductId(
      params.productPostId,
    );
    const chattedUserIds =
      await this.conversationParticipantRepository.findUserIdsByProductPostId(
        params.productPostId,
      );

    // 2. 중복 제거 및 판매자 제외
    const targetUserIds = [
      ...new Set([...likedUserIds, ...chattedUserIds]),
    ].filter((userId) => userId !== params.sellerId);

    if (targetUserIds.length === 0) {
      this.logger.log(
        `알림 대상이 없습니다 (타입: ${params.notificationType}, 상품 ID: ${params.productPostId})`,
      );
      return;
    }

    this.logger.log(
      `알림 대상: ${targetUserIds.length}명 (타입: ${params.notificationType}, 상품 ID: ${params.productPostId})`,
    );

    // 3. 유저 정보 일괄 조회
    const users = await this.userRepository.findByIds(targetUserIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    // 4. 알림 설정이 활성화된 유저만 필터링
    const enabledUserIds = targetUserIds.filter((userId) => {
      const user = userMap.get(userId);
      return user && params.isEnabledCheck(user);
    });

    if (enabledUserIds.length === 0) {
      this.logger.log(
        `알림 활성화 유저가 없습니다 (타입: ${params.notificationType}, 상품 ID: ${params.productPostId})`,
      );
      return;
    }

    // 5. 알림 엔티티 생성 (Bulk Insert 준비)
    const notifications: Notification[] = enabledUserIds.map((userId) => {
      const productStatus = likedUserIds.includes(userId)
        ? NotificationProductStatus.LIKE
        : NotificationProductStatus.CHAT;

      return this.notificationRepository.create({
        userId,
        productId: params.productPostId,
        productStatus,
        notificationType: params.notificationType,
        content: params.notificationContent,
      });
    });

    // 6. Bulk Insert로 알림 저장
    await this.notificationRepository.flush();

    // 7. 성공적으로 저장된 알림만 필터링 (ID가 할당된 것만)
    const savedNotifications = notifications.filter(
      (notification) => notification.id,
    );

    this.logger.log(
      `알림 ${savedNotifications.length}개 DB 저장 완료 (타입: ${params.notificationType})`,
    );

    // 8. SQS 푸시 알림 메시지 배치 생성 및 전송
    const queueUrl = this.configService.get<string>(
      'PUSH_NOTIFICATION_QUEUE_URL',
    );

    if (!queueUrl) {
      this.logger.warn(
        'PUSH_NOTIFICATION_QUEUE_URL이 설정되지 않아 푸시 알림을 전송하지 않습니다.',
      );
      return;
    }

    if (savedNotifications.length === 0) {
      this.logger.warn('저장된 알림이 없어 푸시 알림을 전송하지 않습니다.');
      return;
    }

    // 9. 디바이스 토큰 일괄 조회
    const devices = await this.deviceRepository.findByUserIds(enabledUserIds);

    // userId별 디바이스 토큰 매핑
    const userDeviceTokensMap = new Map<number, string[]>();
    devices.forEach((device) => {
      const userId = device.getUserId();
      const existing = userDeviceTokensMap.get(userId) || [];
      userDeviceTokensMap.set(userId, [...existing, device.getDeviceToken()]);
    });

    // 10. SQS 메시지 생성 (디바이스 토큰 포함)
    const pushMessages = savedNotifications
      .map((notification) => {
        const deviceTokens = userDeviceTokensMap.get(notification.userId) || [];

        // 디바이스 토큰이 없으면 메시지 생성 안 함
        if (deviceTokens.length === 0) {
          return null;
        }

        return {
          type: params.notificationType,
          userId: notification.userId,
          deviceTokens,
          productPostId: params.productPostId,
          productTitle: params.productTitle,
          message: {
            title: params.pushTitle,
            body: params.pushBody,
          },
          timestamp: new Date().toISOString(),
        };
      })
      .filter((msg) => msg !== null);

    try {
      await this.sqsClient.sendMessageBatch(queueUrl, pushMessages);
      this.logger.log(
        `알림 ${pushMessages.length}개 SQS 전송 완료 (타입: ${params.notificationType})`,
      );
    } catch (error) {
      this.logger.error(
        `SQS 메시지 전송 실패 (타입: ${params.notificationType}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
