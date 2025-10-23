import { Entity, Property, PrimaryKey, Enum, Index } from '@mikro-orm/core';
import { PlatformType } from '@app/database/common/enums';
import { BaseEntity } from '../../common/base.entity';
import { DeviceRepository } from './device.repository';

@Entity({ repository: () => DeviceRepository })
export class Device extends BaseEntity {
  @PrimaryKey()
  readonly id!: number;

  @Property()
  readonly userId!: number;

  @Property({ length: 255 })
  deviceToken!: string;

  @Enum(() => PlatformType)
  platform!: PlatformType;

  public getId(): number {
    return this.id;
  }

  public getUserId(): number {
    return this.userId;
  }

  public getDeviceToken(): string {
    return this.deviceToken;
  }

  public setDeviceToken(deviceToken: string): void {
    this.deviceToken = deviceToken;
  }

  public getPlatform(): PlatformType {
    return this.platform;
  }
}
