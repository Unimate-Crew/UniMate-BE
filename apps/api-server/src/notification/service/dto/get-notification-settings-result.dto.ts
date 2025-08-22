import { User } from '@app/database';

export class GetNotificationSettingsResultDto {
  readonly priceChangedNotificationEnabled: boolean;

  readonly saleEndedNotificationEnabled: boolean;

  private constructor(
    priceChangedNotificationEnabled: boolean,
    saleEndedNotificationEnabled: boolean,
  ) {
    this.priceChangedNotificationEnabled = priceChangedNotificationEnabled;
    this.saleEndedNotificationEnabled = saleEndedNotificationEnabled;
  }

  static from(user: User): GetNotificationSettingsResultDto {
    return new GetNotificationSettingsResultDto(
      user.priceChangedNotificationEnabled,
      user.saleEndedNotificationEnabled,
    );
  }
}
