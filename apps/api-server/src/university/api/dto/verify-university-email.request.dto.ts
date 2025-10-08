import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyUniversityEmailRequestDto {
  @ApiProperty({
    description: '인증코드 (6자리 숫자)',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: '인증코드는 6자리 숫자여야 합니다.' })
  code: string;
}
