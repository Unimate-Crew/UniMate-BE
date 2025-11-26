import { ApiProperty } from '@nestjs/swagger';
import { CheckSendPermissionResultDto } from '../../application/dto/check-send-permission-result.dto';

export class CheckSendPermissionResponseDto {
  @ApiProperty({
    description: '메시지 발송 가능 여부',
    example: true,
  })
  canSendMessage!: boolean;

  private constructor(canSendMessage: boolean) {
    this.canSendMessage = canSendMessage;
  }

  static from(
    result: CheckSendPermissionResultDto,
  ): CheckSendPermissionResponseDto {
    return new CheckSendPermissionResponseDto(result.canSendMessage);
  }
}