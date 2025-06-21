import {
  ProductCategory,
  CurrencyType,
  TradeType,
} from '@app/database/common/enums';

export class CreateProductPostParam {
  title: string;

  imageKeys: string[];

  category: ProductCategory;

  price: number;

  currencyType: CurrencyType;

  description: string;

  tradeType: TradeType;

  tradeTypeDescription: string;

  regionId: string;
}
