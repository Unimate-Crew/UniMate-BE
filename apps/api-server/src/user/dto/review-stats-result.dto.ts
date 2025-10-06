import { ApiProperty } from '@nestjs/swagger';

export class ReviewStatsResultDto {
  @ApiProperty({
    description: '별점 평균 (소수점 1자리)',
    example: 4.2,
    required: false,
  })
  averageRating?: number;

  @ApiProperty({
    description: '후기를 보낸 유저 수',
    example: 15,
  })
  reviewCount: number;

  @ApiProperty({
    description: '후기 반영 상태 (3개 미만시 false)',
    example: true,
  })
  isReviewReflected: boolean;

  static of(
    averageRating: number | null,
    reviewCount: number,
  ): ReviewStatsResultDto {
    const dto = new ReviewStatsResultDto();
    const isReviewReflected = reviewCount >= 3;

    dto.averageRating =
      averageRating && isReviewReflected
        ? Math.round(averageRating * 10) / 10
        : undefined;
    dto.reviewCount = reviewCount;
    dto.isReviewReflected = isReviewReflected;

    return dto;
  }
}
