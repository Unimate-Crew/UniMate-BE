import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsValidNickname } from '../../common/decorators/nickname.decorator';

export class UpdateUserProfileRequestDto {
  @ApiProperty({
    description: '닉네임',
    example: 'Jason',
    required: false,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @IsValidNickname()
  nickname?: string;

  @ApiProperty({
    description: '프로필 이미지 키. 필드를 전송하지 않으면 변경하지 않습니다.',
    example: 'user/1752992559501-1234567890.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImageKey?: string;
}
