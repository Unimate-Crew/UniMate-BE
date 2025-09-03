import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserProfileResultDto } from './update-user-profile-result.dto';

export class UpdateUserProfileResponseDto {
  @ApiProperty({
    description: '수정된 닉네임',
    example: 'Jason',
  })
  readonly nickname: string;

  @ApiProperty({
    description: '수정된 프로필 이미지 키',
    example: 'user/1752992559501-1234567890.jpg',
    nullable: true,
  })
  readonly profileImageKey: string | undefined;

  private constructor(nickname: string, profileImageKey: string | undefined) {
    this.nickname = nickname;
    this.profileImageKey = profileImageKey;
  }

  static from(
    result: UpdateUserProfileResultDto,
  ): UpdateUserProfileResponseDto {
    return new UpdateUserProfileResponseDto(
      result.nickname,
      result.profileImageKey,
    );
  }
}
