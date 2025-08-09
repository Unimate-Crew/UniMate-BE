import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductPostResponseDto {
  @ApiProperty({
    description: '수정된 상품 게시글 ID',
    example: 1,
    type: Number,
  })
  productPostId: number;

  private constructor(productPostId: number) {
    this.productPostId = productPostId;
  }

  static of(productPostId: number): UpdateProductPostResponseDto {
    return new UpdateProductPostResponseDto(productPostId);
  }
}
