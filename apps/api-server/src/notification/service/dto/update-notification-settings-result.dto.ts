import { User } from '@app/database';

export class UpdateNotificationSettingsResultDto {
  readonly priceChangedNotificationEnabled: boolean;

  readonly saleEndedNotificationEnabled: boolean;

  private constructor(
    priceChangedNotificationEnabled: boolean,
    saleEndedNotificationEnabled: boolean,
  ) {
    this.priceChangedNotificationEnabled = priceChangedNotificationEnabled;
    this.saleEndedNotificationEnabled = saleEndedNotificationEnabled;
  }

  static from(user: User): UpdateNotificationSettingsResultDto {
    return new UpdateNotificationSettingsResultDto(
      user.priceChangedNotificationEnabled,
      user.saleEndedNotificationEnabled,
    );
  }
}
