import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsValidNickname } from '../../common/decorators/nickname.decorator';

export class CheckNicknameExistsDto {
  @ApiProperty({
    description: '검사할 닉네임',
    example: '홍길동',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @IsValidNickname()
  nickname: string;
}
