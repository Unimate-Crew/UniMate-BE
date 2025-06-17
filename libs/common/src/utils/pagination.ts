/**
 * 무한 스크롤 페이지네이션을 위한 결과 클래스
 */
export class Slice<T> {
  // 결과 데이터
  contents: T[];

  // 다음 페이지 존재 여부
  hasNext: boolean;

  private constructor(contents: T[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  /**
   * Slice 인스턴스를 생성합니다.
   * @param contents 결과 데이터 배열
   * @param hasNext 다음 페이지 존재 여부
   * @returns Slice 인스턴스
   */
  static of<T>(contents: T[], hasNext: boolean): Slice<T> {
    return new Slice<T>(contents, hasNext);
  }

  /**
   * 빈 Slice를 생성합니다.
   * @returns 빈 Slice 인스턴스
   */
  static empty<T>(): Slice<T> {
    return new Slice<T>([], false);
  }

  /**
   * Slice의 각 요소를 주어진 변환 함수를 사용하여 새로운 타입으로 변환합니다.
   * @param transform 각 요소를 변환하는 함수
   * @returns 변환된 요소들로 구성된 새로운 Slice
   */
  map<R>(transform: (item: T) => R): Slice<R> {
    return new Slice<R>(this.contents.map(transform), this.hasNext);
  }
}

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
  content: T[];

  // 페이지 정보
  page: number;
  limit: number;

  // 메타데이터
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
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
    hasNext?: boolean;
  },
): PagedResult<T> {
  const totalItems = options?.totalItems;
  const totalPages = totalItems ? Math.ceil(totalItems / limit) : undefined;
  const hasNext =
    options?.hasNext ??
    (totalPages ? page < totalPages : data.length === limit);

  return {
    content: data,
    page,
    limit,
    totalItems,
    totalPages,
    hasNext,
  };
}
