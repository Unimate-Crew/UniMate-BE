import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewResponseDto {
  @ApiProperty({ description: '생성된 리뷰 ID' })
  id!: number;

  constructor(id: number) {
    this.id = id;
  }

  static of(id: number): CreateReviewResponseDto {
    return new CreateReviewResponseDto(id);
  }
}
