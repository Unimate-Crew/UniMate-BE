import { Device } from '@app/database';
import { PlatformType } from '@app/database/common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceResultDto {
  @ApiProperty({ description: '디바이스 ID' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ApiProperty({ description: '디바이스 토큰' })
  deviceToken: string;

  @ApiProperty({ description: '플랫폼 종류', enum: PlatformType })
  platform: PlatformType;

  @ApiProperty({ description: '등록 일시' })
  createdAt: Date;

  private constructor(
    id: number,
    userId: number,
    deviceToken: string,
    platform: PlatformType,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.deviceToken = deviceToken;
    this.platform = platform;
    this.createdAt = createdAt;
  }

  static fromEntity(device: Device): RegisterDeviceResultDto {
    return new RegisterDeviceResultDto(
      device.getId(),
      device.getUserId(),
      device.getDeviceToken(),
      device.getPlatform(),
      device.getCreatedAt(),
    );
  }
}
