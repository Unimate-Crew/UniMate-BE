import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendVerificationCodeRequestDto {
  @ApiProperty({
    description: '대학교 이메일 주소',
    example: 'student@snu.ac.kr',
  })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}
