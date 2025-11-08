import { CurrencyType } from '../../../common/enums';

export class CurrencyPriceRangeDto {
  constructor(
    public readonly currencyType: CurrencyType,
    public readonly minPrice: number,
    public readonly maxPrice: number,
  ) {}
}
