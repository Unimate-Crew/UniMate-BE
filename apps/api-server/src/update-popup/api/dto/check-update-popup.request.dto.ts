import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PlatformType } from '@app/database/common/enums';

export class CheckUpdatePopupRequestDto {
  @ApiProperty({
    description: '플랫폼 종류',
    enum: PlatformType,
    example: PlatformType.IOS,
  })
  @IsEnum(PlatformType)
  platform: PlatformType;

  @ApiProperty({
    description: '현재 앱 버전 (semver 형식: x.y.z)',
    example: '1.2.0',
  })
  @IsString()
  @IsNotEmpty()
  version: string;
}
