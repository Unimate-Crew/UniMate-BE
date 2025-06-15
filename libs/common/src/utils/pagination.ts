/**
 * 페이지네이션 기본 인터페이스
 * 오프셋 방식 페이지네이션 구조
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 페이지네이션 결과 인터페이스
 */
export interface PagedResult<T> {
  items: T[];
  hasNext: boolean;
}

/**
 * 오프셋 기반 페이지네이션을 위한 결과 생성 함수
 */
export function createPagedResult<T>(data: T[], limit: number): PagedResult<T> {
  if (data.length <= limit) {
    return {
      items: data,
      hasNext: false,
    };
  }

  return {
    items: data.slice(0, limit),
    hasNext: true,
  };
}
