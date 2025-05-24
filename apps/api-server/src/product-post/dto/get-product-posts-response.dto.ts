// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType, TradeStatus } from '../../common/enums';

export class ProductPostItemDto {
  @ApiProperty({
    description: '상품 게시글 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '상품 게시글 제목',
    example: '미국 뉴욕 여행 가이드북 팝니다',
  })
  title: string;

  @ApiProperty({
    description: '상품 게시글 생성 시간',
    example: '2023-06-15T09:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '대학교 이름',
    example: '서울대학교',
  })
  universityName: string;

  @ApiProperty({
    description: '상품 게시글 대표 사진 URL',
    example: 'https://example.com/images/product-post1.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: '가격',
    example: 15000,
  })
  price: number;

  @ApiProperty({
    description: '통화 타입',
    example: CurrencyType.KRW,
    enum: CurrencyType,
  })
  currencyType: CurrencyType;

  @ApiProperty({
    description: '좋아요 수',
    example: 24,
  })
  likeCount: number;

  @ApiProperty({
    description: '댓글 수',
    example: 5,
  })
  commentCount: number;

  @ApiProperty({
    description: '도시 ID',
    example: 1,
  })
  cityId: number;

  @ApiProperty({
    description: '도시 이름',
    example: '서울',
  })
  cityName: string;

  @ApiProperty({
    description: '거래 상태',
    example: TradeStatus.FOR_SALE,
    enum: TradeStatus,
  })
  tradeStatus: TradeStatus;
}

export class GetProductPostsResponseDto {
  @ApiProperty({
    description: '상품 게시글 목록',
    type: [ProductPostItemDto],
  })
  content: ProductPostItemDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  static of(
    content: ProductPostItemDto[],
    hasNext: boolean,
  ): GetProductPostsResponseDto {
    const response = new GetProductPostsResponseDto();
    response.content = content;
    response.hasNext = hasNext;
    return response;
  }
}
