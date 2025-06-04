export enum ErrorCode {
  // 인증/인가
  UNAUTHORIZED = 'A001',
  INVALID_SNS_TOKEN = 'A002',

  // 유저
  USER_NOT_FOUND = 'U001',
  SNS_USER_INFO_MISMATCH = 'U002',

  // 서버 오류
  INTERNAL_SERVER_ERROR = 'G001',

  // 지역
  REGION_NOT_FOUND = 'R001',

  // 관심도시
  INTEREST_CITY_NOT_FOUND = 'IC001',

  // 관심지역
  INTEREST_REGION_NOT_FOUND = 'IR001',
}
