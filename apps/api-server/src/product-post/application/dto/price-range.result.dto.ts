// eslint-disable-next-line max-classes-per-file
import { CurrencyType } from '@app/database';

export class PriceRangeItemDto {
  constructor(
    public readonly minPrice: number,
    public readonly maxPrice: number,
  ) {}
}

export class PriceRangeResultDto {
  constructor(
    public readonly currencyRanges: Map<CurrencyType, PriceRangeItemDto>,
  ) {}
}
