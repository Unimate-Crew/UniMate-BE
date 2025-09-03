import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsRequestDto {
  @ApiProperty({
    description: '가격 변동 알림 활성화 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly priceChangedNotificationEnabled?: boolean;

  @ApiProperty({
    description: '판매 종료 알림 활성화 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly saleEndedNotificationEnabled?: boolean;
}
