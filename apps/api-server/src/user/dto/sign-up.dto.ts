import { AuthProvider } from '@app/database';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: '인증 제공자 (NAVER, KAKAO 등)',
    enum: AuthProvider,
    example: AuthProvider.KAKAO,
    required: true,
  })
  provider!: AuthProvider;

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
  accessToken!: string;

  @ApiProperty({
    description: '유저 닉네임',
    example: '홍길동',
    required: true,
  })
  nickname!: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImageUrl?: string;
}
