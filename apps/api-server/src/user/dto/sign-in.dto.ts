import { OAuthProvider } from '@app/database';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
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
}
