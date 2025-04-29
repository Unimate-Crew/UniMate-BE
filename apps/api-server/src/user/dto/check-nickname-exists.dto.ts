import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckNicknameExistsDto {
  @ApiProperty({
    description: '검사할 닉네임',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
