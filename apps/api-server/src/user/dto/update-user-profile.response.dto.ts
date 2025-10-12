import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserProfileResultDto } from './update-user-profile-result.dto';

export class UpdateUserProfileResponseDto {
  @ApiProperty({
    description: '수정된 닉네임',
    example: 'Jason',
    required: false,
  })
  readonly nickname?: string;

  @ApiProperty({
    description: '수정된 프로필 이미지 URL',
    example:
      'https://s3.amazonaws.com/bucket/user/1752992559501-1234567890.jpg',
    required: false,
  })
  readonly profileImageUrl?: string;

  private constructor(nickname?: string, profileImageUrl?: string) {
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
  }

  static from(
    result: UpdateUserProfileResultDto,
  ): UpdateUserProfileResponseDto {
    return new UpdateUserProfileResponseDto(
      result.nickname,
      result.profileImageUrl,
    );
  }
}
