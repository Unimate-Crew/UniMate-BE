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
  NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MySalesFilter {
  FOR_SALE = 'FOR_SALE', // 판매중
  COMPLETED = 'COMPLETED', // 거래완료
  HIDDEN = 'HIDDEN', // 숨김
}

export enum UserSalesFilter {
  FOR_SALE = 'FOR_SALE', // 판매중
  COMPLETED = 'COMPLETED', // 거래완료
}

export enum CountryCode {
  US = 'US', // 미국
}

export enum ConversationMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM',
}

export enum TradeProgressStatus {
  RESERVED = 'RESERVED',
  COMPLETED = 'COMPLETED',
}

export enum PlatformType {
  IOS = 'iOS',
  ANDROID = 'ANDROID',
}

export enum UpdateType {
  FORCE = 'FORCE',
  RECOMMEND = 'RECOMMEND',
}

export enum ReportReason {
  BAD_MANNER = 'BAD_MANNER', // 비매너
  SCAM_SUSPICION = 'SCAM_SUSPICION', // 사기 의심
  HATE_SPEECH = 'HATE_SPEECH', // 욕설, 비방, 혐오표현 사용
  SEXUAL_HARASSMENT = 'SEXUAL_HARASSMENT', // 부적절한 성적 행위
  ETC = 'ETC', // 기타
}

export enum TermsType {
  AGE_VERIFICATION = 'AGE_VERIFICATION', // 만 14세 이상
  SERVICE_TERMS = 'SERVICE_TERMS', // 이용약관
  PRIVACY_POLICY = 'PRIVACY_POLICY', // 개인정보 처리방침
}
