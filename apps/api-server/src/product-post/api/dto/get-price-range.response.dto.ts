// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType } from '@app/database/common/enums';
import {
  PriceRangeResultDto,
  PriceRangeItemDto,
} from '../../application/dto/price-range.result.dto';

class CurrencyPriceRangeItemDto {
  @ApiProperty({
    description: '최소 가격',
    example: 5000,
  })
  minPrice: number;

  @ApiProperty({
    description: '최대 가격',
    example: 50000,
  })
  maxPrice: number;

  constructor(minPrice: number, maxPrice: number) {
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
  }
}

export class GetPriceRangeResponseDto {
  @ApiProperty({
    description: '원화(KRW) 가격 범위',
    type: CurrencyPriceRangeItemDto,
  })
  krw: CurrencyPriceRangeItemDto;

  @ApiProperty({
    description: '달러(USD) 가격 범위',
    type: CurrencyPriceRangeItemDto,
  })
  usd: CurrencyPriceRangeItemDto;

  constructor(krw: CurrencyPriceRangeItemDto, usd: CurrencyPriceRangeItemDto) {
    this.krw = krw;
    this.usd = usd;
  }

  static of(resultDto: PriceRangeResultDto): GetPriceRangeResponseDto {
    const krwRange = resultDto.currencyRanges.get(CurrencyType.KRW);
    const usdRange = resultDto.currencyRanges.get(CurrencyType.USD);

    return new GetPriceRangeResponseDto(
      krwRange
        ? new CurrencyPriceRangeItemDto(krwRange.minPrice, krwRange.maxPrice)
        : new CurrencyPriceRangeItemDto(0, 100),
      usdRange
        ? new CurrencyPriceRangeItemDto(usdRange.minPrice, usdRange.maxPrice)
        : new CurrencyPriceRangeItemDto(0, 1000),
    );
  }
}
