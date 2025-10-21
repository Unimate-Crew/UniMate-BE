import { ApiProperty } from '@nestjs/swagger';
import { PlatformType } from '@app/database/common/enums';
import { RegisterDeviceResultDto } from '../../service/dto/register-device-result.dto';

export class RegisterDeviceResponseDto {
  @ApiProperty({
    description: '디바이스 ID',
    example: 1,
  })
  readonly id: number;

  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  readonly userId: number;

  @ApiProperty({
    description: '디바이스 토큰',
    example: 'abc123def456...',
  })
  readonly deviceToken: string;

  @ApiProperty({
    description: '플랫폼 종류',
    enum: PlatformType,
    example: PlatformType.IOS,
  })
  readonly platform: PlatformType;

  @ApiProperty({
    description: '등록 일시',
    example: '2025-10-22T12:00:00.000Z',
  })
  readonly createdAt: Date;

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

  static from(result: RegisterDeviceResultDto): RegisterDeviceResponseDto {
    return new RegisterDeviceResponseDto(
      result.id,
      result.userId,
      result.deviceToken,
      result.platform,
      result.createdAt,
    );
  }
}
