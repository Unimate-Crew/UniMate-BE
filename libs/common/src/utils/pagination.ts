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
  // 결과 데이터
  data: T[];

  // 페이지 정보
  page: number;
  limit: number;

  // 메타데이터
  totalItems?: number;
  totalPages?: number;
  hasMore?: boolean;
}

/**
 * 오프셋 기반 페이지네이션을 위한 결과 생성 함수
 */
export function createPagedResult<T>(
  data: T[],
  page: number,
  limit: number,
  options?: {
    totalItems?: number;
    hasMore?: boolean;
  },
): PagedResult<T> {
  const totalItems = options?.totalItems;
  const totalPages = totalItems ? Math.ceil(totalItems / limit) : undefined;
  const hasMore =
    options?.hasMore ??
    (totalPages ? page < totalPages : data.length === limit);

  return {
    data,
    page,
    limit,
    totalItems,
    totalPages,
    hasMore,
  };
}
