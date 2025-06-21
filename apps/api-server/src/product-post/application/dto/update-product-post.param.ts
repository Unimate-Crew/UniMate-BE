import {
  TradeStatus,
  CurrencyType,
  ProductCategory,
  TradeType,
} from '@app/database/common/enums';

export class UpdateProductPostParam {
  constructor(
    tradeStatus?: TradeStatus,
    title?: string,
    description?: string,
    price?: number,
    currencyType?: CurrencyType,
    category?: ProductCategory,
    tradeType?: TradeType,
    tradeTypeDescription?: string,
  ) {
    this.tradeStatus = tradeStatus;
    this.title = title;
    this.description = description;
    this.price = price;
    this.currencyType = currencyType;
    this.category = category;
    this.tradeType = tradeType;
    this.tradeTypeDescription = tradeTypeDescription;
  }

  tradeStatus?: TradeStatus;

  title?: string;

  description?: string;

  price?: number;

  currencyType?: CurrencyType;

  category?: ProductCategory;

  tradeType?: TradeType;

  tradeTypeDescription?: string;
}
