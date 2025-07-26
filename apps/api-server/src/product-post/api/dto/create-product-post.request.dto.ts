import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import {
  CurrencyType,
  ProductCategory,
  TradeType,
} from '@app/database/common/enums';

export class CreateProductPostRequestDto {
  @ApiProperty({
    description: '제품 게시글 제목',
    example: '아이폰 15 Pro 팝니다',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: '제품 이미지 키 배열 (첫 번째 이미지가 썸네일)',
    example: [
      'product-post/1752992559501-1234567890.jpg',
      'product-post/1752992559502-1234567891.jpg',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  imageKeys: string[];

  @ApiProperty({
    description: '제품 카테고리',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
  })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({
    description: '제품 가격',
    example: 1000000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: '통화 타입',
    enum: CurrencyType,
    example: CurrencyType.KRW,
  })
  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @ApiProperty({
    description: '제품 상세 설명',
    example: '1년 사용한 아이폰 15 Pro 판매합니다. 상태 좋습니다.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: '거래 방식',
    enum: TradeType,
    example: TradeType.DIRECT,
  })
  @IsEnum(TradeType)
  tradeType: TradeType;

  @ApiProperty({
    description: '거래 방식 상세 설명',
    example: '강남역 2번 출구에서 거래 가능합니다.',
  })
  @IsString()
  @IsNotEmpty()
  tradeTypeDescription: string;

  @ApiProperty({
    description: '지역 ID',
    example: '3651000',
  })
  @IsString()
  @IsNotEmpty()
  regionId: string;
}
