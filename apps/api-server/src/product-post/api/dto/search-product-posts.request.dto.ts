import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CurrencyType,
  ProductCategory,
  SortDirection,
  TradeStatus,
} from '@app/database/common/enums';
import { PageRequest } from '@app/common';

export class SearchProductPostsRequestDto extends PageRequest {
  @ApiProperty({
    description: '검색 키워드 (제목 기준 또는 설명으로 검색)',
    example: '가이드북',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchKeyword?: string;

  @ApiProperty({
    description: '대학교 ID 필터',
    example: 1,
    required: false,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  universityId?: number;

  @ApiProperty({
    description: '최소 가격 필터',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({
    description: '최대 가격 필터',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({
    description: '통화 종류',
    enum: CurrencyType,
    example: CurrencyType.KRW,
    required: false,
  })
  @IsEnum(CurrencyType)
  @IsOptional()
  currencyType?: CurrencyType;

  @ApiProperty({
    description: '카테고리 필터',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
    required: false,
  })
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @ApiProperty({
    description: '거래 상태 필터',
    enum: TradeStatus,
    example: TradeStatus.FOR_SALE,
    required: false,
  })
  @IsEnum(TradeStatus)
  @IsOptional()
  tradeStatus?: TradeStatus;

  @ApiProperty({
    description: '정렬 방향 (DESC: 최신순, ASC: 오래된순)',
    enum: SortDirection,
    example: SortDirection.DESC,
    default: SortDirection.DESC,
    required: false,
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection?: SortDirection = SortDirection.DESC;

  @ApiProperty({
    description: '지역 ID',
    example: 1,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  regionId: string;
}
