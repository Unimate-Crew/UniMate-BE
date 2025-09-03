import { ApiProperty } from '@nestjs/swagger';
import { GetNotificationSettingsResultDto } from '../../service/dto/get-notification-settings-result.dto';

export class GetNotificationSettingsResponseDto {
  @ApiProperty({
    description: '가격 변동 알림 활성화 여부',
    example: true,
  })
  readonly priceChangedNotificationEnabled: boolean;

  @ApiProperty({
    description: '판매 종료 알림 활성화 여부',
    example: true,
  })
  readonly saleEndedNotificationEnabled: boolean;

  constructor(
    priceChangedNotificationEnabled: boolean,
    saleEndedNotificationEnabled: boolean,
  ) {
    this.priceChangedNotificationEnabled = priceChangedNotificationEnabled;
    this.saleEndedNotificationEnabled = saleEndedNotificationEnabled;
  }

  static from(
    result: GetNotificationSettingsResultDto,
  ): GetNotificationSettingsResponseDto {
    return new GetNotificationSettingsResponseDto(
      result.priceChangedNotificationEnabled,
      result.saleEndedNotificationEnabled,
    );
  }
}
