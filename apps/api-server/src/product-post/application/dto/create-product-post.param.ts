import {
  ProductCategory,
  CurrencyType,
  TradeType,
} from '@app/database/common/enums';

export class CreateProductPostParam {
  title: string;
  imageUrls: string[];
  category: ProductCategory;
  price: number;
  currencyType: CurrencyType;
  description: string;
  tradeType: TradeType;
  tradeTypeDescription: string;
  regionId: string;
}
