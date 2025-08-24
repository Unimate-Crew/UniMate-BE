import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewRequestDto {
  @ApiProperty({ description: '상품 게시글 ID' })
  @IsInt()
  productPostId!: number;

  @ApiProperty({ description: '거래 만족도(1~5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ description: '리뷰 내용', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
