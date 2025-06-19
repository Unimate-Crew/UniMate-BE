export enum CurrencyType {
  KRW = 'KRW',
  USD = 'USD',
}

export enum TradeStatus {
  FOR_SALE = 'FOR_SALE',
  RESERVED = 'RESERVED',
  COMPLETED = 'COMPLETED',
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS', // 전자기기
  HOME_APPLIANCES = 'HOME_APPLIANCES', // 가전제품
  FURNITURE_INTERIOR = 'FURNITURE_INTERIOR', // 가구/인테리어
  HOUSEHOLD_KITCHEN = 'HOUSEHOLD_KITCHEN', // 생활/주방
  WOMENS_CLOTHING = 'WOMENS_CLOTHING', // 여성의류
  WOMENS_ACCESSORIES = 'WOMENS_ACCESSORIES', // 여성잡화
  MENS_FASHION = 'MENS_FASHION', // 남성의류/잡화
  BEAUTY_COSMETICS = 'BEAUTY_COSMETICS', // 뷰티/미용
  SPORTS_LEISURE = 'SPORTS_LEISURE', // 스포츠/레저
  HOBBY_GAME = 'HOBBY_GAME', // 취미/게임
  BOOKS_RECORDS = 'BOOKS_RECORDS', // 도서/음반
  TICKETS_VOUCHERS = 'TICKETS_VOUCHERS', // 티켓/교환권
  FOOD = 'FOOD', // 식품
  OTHER_GOODS = 'OTHER_GOODS', // 기타 중고물품
  BUYING = 'BUYING', // 삽니다
}

export enum TradeType {
  DIRECT = 'DIRECT', // 직거래
  ONLINE = 'ONLINE', // 비대면 거래
}

export enum NotificationProductStatus {
  CHAT = 'CHAT',
  LIKE = 'LIKE',
}

export enum NotificationType {
  SALE_ENDED = 'SALE_ENDED',
  PRICE_CHANGED = 'PRICE_CHANGED',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
