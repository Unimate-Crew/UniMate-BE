import { CurrencyType, TradeStatus } from '@app/database/common/enums';

export class ProductPostInfo {
  id: number;
  title: string;
  createdAt: string;
  universityName: string;
  thumbnailUrl: string;
  price: number;
  currencyType: CurrencyType;
  likeCount: number;
  chatRoomCount: number;
  regionId: string;
  regionName: string;
  tradeStatus: TradeStatus;
}
