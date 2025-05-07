import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType, TradeStatus } from '../../common/enums';

export class ProductDto {
  @ApiProperty({
    description: '상품 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '상품 제목',
    example: '메사추세츠 여행 가이드북 팝니다',
  })
  title: string;

  @ApiProperty({
    description: '생성일',
    example: '2023-06-15T09:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '대학교 이름',
    example: 'Harvard University',
  })
  universityName: string;

  @ApiProperty({
    description: '썸네일 이미지 URL',
    example: 'https://example.com/images/product1.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: '가격',
    example: 15000,
  })
  price: number;

  @ApiProperty({
    description: '통화 타입',
    enum: CurrencyType,
    example: CurrencyType.KRW,
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
    example: 'Massachusetts',
  })
  cityName: string;

  @ApiProperty({
    description: '거래 상태',
    enum: TradeStatus,
    example: TradeStatus.FOR_SALE,
  })
  tradeStatus: TradeStatus;
}
