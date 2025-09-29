import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({
    description: '발급된 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '발급된 리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  private constructor(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
  }

  static of(accessToken: string, refreshToken: string): TokensDto {
    return new TokensDto(accessToken, refreshToken);
  }
}
