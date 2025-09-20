/**
 * Redis 키 생성 유틸리티 함수
 * @param parts 키 구성 요소들
 * @returns 콜론으로 연결된 Redis 키
 */
export function buildRedisKey(...parts: (string | number)[]): string {
  return parts.map((part) => String(part)).join(':');
}