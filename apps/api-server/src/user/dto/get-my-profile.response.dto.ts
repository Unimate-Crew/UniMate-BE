import { ApiProperty } from '@nestjs/swagger';
import { UniversityInfoDto } from './university-info.dto';
import { InterestRegionInfosDto } from './inrerest-resion-info.dto';

export class GetMyProfileResponseDto {
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

  @ApiProperty({
    description: '관심 지역 정보',
    type: InterestRegionInfosDto,
  })
  interestRegions: InterestRegionInfosDto;

  static of(
    nickname: string,
    profileImageKey: string | undefined,
    university: UniversityInfoDto | undefined,
    interestRegions: InterestRegionInfosDto,
  ): GetMyProfileResponseDto {
    const dto = new GetMyProfileResponseDto();
    dto.nickname = nickname;
    dto.profileImageKey = profileImageKey;
    dto.university = university;
    dto.interestRegions = interestRegions;
    return dto;
  }
}
