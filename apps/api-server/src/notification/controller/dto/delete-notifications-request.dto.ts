import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteNotificationsRequestDto {
  @ApiProperty({
    description: '삭제할 알림 ID 목록',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  notificationIds: number[];
}
