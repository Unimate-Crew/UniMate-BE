import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PlatformType } from '@app/database/common/enums';

export class RegisterDeviceRequestDto {
  @ApiProperty({
    description: '디바이스 토큰',
    example: 'abc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  readonly deviceToken: string;

  @ApiProperty({
    description: '플랫폼 종류',
    enum: PlatformType,
    example: PlatformType.IOS,
  })
  @IsEnum(PlatformType)
  @IsNotEmpty()
  readonly platform: PlatformType;
}
