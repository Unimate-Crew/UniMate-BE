import { ApiProperty } from '@nestjs/swagger';
import { UniversityInfoDto } from './university-info.dto';
import { ReviewStatsResultDto } from './review-stats-result.dto';

export class GetUserProfileResponseDto {
  @ApiProperty({
    description: '닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://s3.amazonaws.com/bucket/user/profile/image.jpg',
  })
  profileImageUrl: string;

  @ApiProperty({
    description: '대학교 정보',
    type: UniversityInfoDto,
    required: false,
  })
  university?: UniversityInfoDto;

  @ApiProperty({
    description: '거래 후기 통계',
    type: ReviewStatsResultDto,
  })
  reviewStats: ReviewStatsResultDto;

  static of(
    nickname: string,
    profileImageUrl: string | undefined,
    university: UniversityInfoDto | undefined,
    reviewStats: ReviewStatsResultDto,
  ): GetUserProfileResponseDto {
    const dto = new GetUserProfileResponseDto();
    dto.nickname = nickname;
    dto.profileImageUrl = profileImageUrl;
    dto.university = university;
    dto.reviewStats = reviewStats;
    return dto;
  }
}
