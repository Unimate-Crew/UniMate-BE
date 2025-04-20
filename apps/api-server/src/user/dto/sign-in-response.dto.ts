import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({
    description: '발급된 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  private constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static of(accessToken: string): SignInResponseDto {
    return new SignInResponseDto(accessToken);
  }
}
