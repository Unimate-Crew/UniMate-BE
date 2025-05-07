import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  CurrencyType,
  ProductCategory,
  SortDirection,
  TradeStatus,
} from '../../common/enums';

export class SearchProductsRequestDto {
  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchKeyword?: string;

  @ApiProperty({
    description: '대학교 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  universityId?: number;

  @ApiProperty({
    description: '통화 타입',
    enum: CurrencyType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CurrencyType)
  currencyType?: CurrencyType;

  @ApiProperty({
    description: '최소 가격',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: '최대 가격',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: '상품 카테고리',
    enum: ProductCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiProperty({
    description: '거래 상태',
    enum: TradeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TradeStatus)
  tradeStatus?: TradeStatus;

  @ApiProperty({
    description: '정렬 방향',
    enum: SortDirection,
    required: false,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;

  @ApiProperty({
    description: '페이지 번호',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageNumber?: number = 1;

  @ApiProperty({
    description: '페이지 크기',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @ApiProperty({
    description: '도시 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;
}
