// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class GetProductsResponseDto {
  @ApiProperty({
    description: '상품 목록',
    type: [ProductDto],
  })
  content: ProductDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: false,
  })
  hasNext: boolean;

  private constructor(content: ProductDto[], hasNext: boolean) {
    this.content = content;
    this.hasNext = hasNext;
  }

  static of(content: ProductDto[], hasNext: boolean): GetProductsResponseDto {
    return new GetProductsResponseDto(content, hasNext);
  }
}
