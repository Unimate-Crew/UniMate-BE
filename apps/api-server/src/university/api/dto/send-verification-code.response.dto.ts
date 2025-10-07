import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationCodeResponseDto {
  @ApiProperty({
    description: '인증코드 유효 기간 (초)',
    example: 600,
  })
  expiresInSeconds: number;

  static of(expiresInSeconds: number): SendVerificationCodeResponseDto {
    const response = new SendVerificationCodeResponseDto();
    response.expiresInSeconds = expiresInSeconds;
    return response;
  }
}
