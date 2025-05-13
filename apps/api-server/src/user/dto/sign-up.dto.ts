import { OAuthProvider } from '@app/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: '인증 제공자 (NAVER, KAKAO 등)',
    enum: OAuthProvider,
    example: OAuthProvider.KAKAO,
    required: true,
  })
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider!: OAuthProvider;

  @ApiProperty({
    description: '인증 제공자로부터 받은 유저 ID',
    example: '123456789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  providerId!: string;

  @ApiProperty({
    description: '인증 제공자로부터 받은 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  oAuthToken!: string;

  @ApiProperty({
    description: '유저 닉네임',
    example: '홍길동',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
