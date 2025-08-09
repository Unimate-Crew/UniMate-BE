import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TradeStatus } from '@app/database/common/enums';

export class FindMySalesRequestDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageNumber?: number = 1;

  @ApiProperty({
    description: '페이지 크기 (한 페이지에 포함되는 아이템 수)',
    example: 10,
    required: false,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiProperty({
    description: '거래 상태 필터',
    enum: TradeStatus,
    example: TradeStatus.FOR_SALE,
    required: false,
  })
  @IsEnum(TradeStatus)
  @IsOptional()
  tradeStatus?: TradeStatus;
}
