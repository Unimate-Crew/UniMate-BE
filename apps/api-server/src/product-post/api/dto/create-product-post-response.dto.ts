import { ApiProperty } from '@nestjs/swagger';

export class CreateProductPostResponseDto {
  @ApiProperty({
    description: '생성된 상품 게시글 ID',
    example: 1,
  })
  productPostId: number;

  constructor(productPostId: number) {
    this.productPostId = productPostId;
  }

  static of(productPostId: number): CreateProductPostResponseDto {
    return new CreateProductPostResponseDto(productPostId);
  }
}
