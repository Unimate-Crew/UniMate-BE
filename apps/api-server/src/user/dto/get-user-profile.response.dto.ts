import { ApiProperty } from '@nestjs/swagger';
import { UniversityInfoDto } from './university-info.dto';

export class GetUserProfileResponseDto {
  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 키',
    example: 'user/profile/image.jpg',
  })
  profileImageKey: string;

  @ApiProperty({
    description: '대학교 정보',
    type: UniversityInfoDto,
    required: false,
  })
  university?: UniversityInfoDto;

  static of(
    nickname: string,
    profileImageKey: string | undefined,
    university: UniversityInfoDto | undefined,
  ): GetUserProfileResponseDto {
    const dto = new GetUserProfileResponseDto();
    dto.nickname = nickname;
    dto.profileImageKey = profileImageKey;
    dto.university = university;
    return dto;
  }
}
