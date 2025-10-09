import { ApiProperty } from '@nestjs/swagger';
import { UniversityInfoDto } from './university-info.dto';
import { ReviewStatsResultDto } from './review-stats-result.dto';

export class GetUserProfileResultDto {
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

  @ApiProperty({
    description: '대학교 이메일',
    example: 'student@university.ac.kr',
    required: false,
  })
  universityEmail?: string;

  static of(
    nickname: string,
    profileImageUrl: string | undefined,
    university: UniversityInfoDto | undefined,
    reviewStats: ReviewStatsResultDto,
    universityEmail: string | undefined,
  ): GetUserProfileResultDto {
    const dto = new GetUserProfileResultDto();
    dto.nickname = nickname;
    dto.profileImageUrl = profileImageUrl;
    dto.university = university;
    dto.reviewStats = reviewStats;
    dto.universityEmail = universityEmail;
    return dto;
  }
}
