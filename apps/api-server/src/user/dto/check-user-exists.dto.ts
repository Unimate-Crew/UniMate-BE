import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from '@app/database';

export class CheckUserExistsDto {
  @ApiProperty({
    description: '인증 제공자 (NAVER, KAKAO 등)',
    enum: OAuthProvider,
    example: OAuthProvider.KAKAO,
    required: true,
  })
  provider!: OAuthProvider;

  @ApiProperty({
    description: '인증 제공자로부터 받은 유저 ID',
    example: '123456789',
    required: true,
  })
  providerId!: string;

  @ApiProperty({
    description: '인증 제공자로부터 받은 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  oAuthToken!: string;
}
