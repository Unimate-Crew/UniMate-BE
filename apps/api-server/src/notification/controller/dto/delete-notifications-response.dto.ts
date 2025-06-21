import { ApiProperty } from '@nestjs/swagger';
import { DeleteNotificationsResultDto } from '../../service/dto/delete-notifications-result.dto';

export class DeleteNotificationsResponseDto {
  @ApiProperty({
    description: '삭제된 알림 개수',
    example: 1,
  })
  deletedCount: number;

  @ApiProperty({
    description: '삭제 성공 여부',
    example: true,
  })
  success: boolean;

  private constructor(deletedCount: number) {
    this.deletedCount = deletedCount;
    this.success = deletedCount > 0;
  }

  static fromResult(
    result: DeleteNotificationsResultDto,
  ): DeleteNotificationsResponseDto {
    return new DeleteNotificationsResponseDto(result.deletedCount);
  }
}
