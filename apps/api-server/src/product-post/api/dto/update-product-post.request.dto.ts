import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
} from 'class-validator';
import {
  TradeStatus,
  CurrencyType,
  ProductCategory,
  TradeType,
} from '@app/database/common/enums';

export class UpdateProductPostRequestDto {
  @ApiProperty({
    description: '거래 상태',
    enum: TradeStatus,
    example: TradeStatus.RESERVED,
    required: false,
  })
  @IsEnum(TradeStatus)
  @IsOptional()
  tradeStatus?: TradeStatus;

  @ApiProperty({
    description: '제품 게시글 제목',
    example: '아이폰 15 Pro 팝니다',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: '제품 상세 설명',
    example: '1년 사용한 아이폰 15 Pro 판매합니다. 상태 좋습니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '제품 가격',
    example: 1000000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: '통화 타입',
    enum: CurrencyType,
    example: CurrencyType.KRW,
    required: false,
  })
  @IsEnum(CurrencyType)
  @IsOptional()
  currencyType?: CurrencyType;

  @ApiProperty({
    description: '제품 카테고리',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
    required: false,
  })
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @ApiProperty({
    description: '거래 방식',
    enum: TradeType,
    example: TradeType.DIRECT,
    required: false,
  })
  @IsEnum(TradeType)
  @IsOptional()
  tradeType?: TradeType;

  @ApiProperty({
    description: '거래 방식 상세 설명',
    example: '강남역 2번 출구에서 거래 가능합니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  tradeTypeDescription?: string;
}
