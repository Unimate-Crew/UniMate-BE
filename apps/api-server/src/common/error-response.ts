import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '@app/common';

export class ErrorResponse {
  @ApiProperty({
    description: '에러 코드',
    enum: ErrorCode,
  })
  public readonly code: ErrorCode;

  @ApiProperty({
    description: '에러 메시지',
  })
  public readonly message: string;

  constructor(code: ErrorCode, message: string) {
    this.code = code;
    this.message = message;
  }
}
