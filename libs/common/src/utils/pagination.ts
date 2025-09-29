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
  contents: T[];
  hasNext: boolean;
}

/**
 * 커서 기반 페이지네이션 결과 인터페이스
 */
export interface CursorResult<T> {
  contents: T[];
  nextCursor?: any;
}

/**
 * 오프셋 기반 페이지네이션을 위한 결과 생성 함수
 */
export function createPagedResult<T>(data: T[], limit: number): PagedResult<T> {
  if (data.length <= limit) {
    return {
      contents: data,
      hasNext: false,
    };
  }

  return {
    contents: data.slice(0, limit),
    hasNext: true,
  };
}

/**
 * 커서 기반 페이지네이션을 위한 결과 클래스
 */
export class CursorSlice<T> {
  // 결과 데이터
  contents: T[];

  // 다음 페이지 존재 여부
  hasNext: boolean;

  // 다음 커서 (없으면 마지막 페이지)
  nextCursor?: any;

  protected constructor(contents: T[], hasNext: boolean, nextCursor?: any) {
    this.contents = contents;
    this.hasNext = hasNext;
    this.nextCursor = nextCursor;
  }

  /**
   * CursorSlice 인스턴스를 생성합니다.
   * @param contents 결과 데이터 배열
   * @param hasNext 다음 페이지 존재 여부
   * @param nextCursor 다음 커서 (없으면 마지막 페이지)
   * @returns CursorSlice 인스턴스
   */
  static of<T>(
    contents: T[],
    hasNext: boolean,
    nextCursor?: any,
  ): CursorSlice<T> {
    return new CursorSlice<T>(contents, hasNext, nextCursor);
  }

  /**
   * 빈 CursorSlice를 생성합니다.
   * @returns 빈 CursorSlice 인스턴스
   */
  static empty<T>(): CursorSlice<T> {
    return new CursorSlice<T>([], false, undefined);
  }

  /**
   * 데이터 배열로부터 CursorSlice를 생성합니다.
   * @param data 원본 데이터 배열
   * @param limit 페이지 크기
   * @param getCursor 커서 추출 함수
   * @returns CursorSlice 인스턴스
   */
  static fromData<T>(
    data: T[],
    limit: number,
    getCursor: (item: T) => any,
  ): CursorSlice<T> {
    if (data.length <= limit) {
      return new CursorSlice<T>(data, false, undefined);
    }

    const contents = data.slice(0, limit);
    const nextCursor =
      contents.length > 0
        ? getCursor(contents[contents.length - 1])
        : undefined;

    return new CursorSlice<T>(contents, true, nextCursor);
  }

  /**
   * CursorSlice의 각 요소를 주어진 변환 함수를 사용하여 새로운 타입으로 변환합니다.
   * @param transform 각 요소를 변환하는 함수
   * @returns 변환된 요소들로 구성된 새로운 CursorSlice
   */
  map<R>(transform: (item: T) => R): CursorSlice<R> {
    return new CursorSlice<R>(
      this.contents.map(transform),
      this.hasNext,
      this.nextCursor,
    );
  }
}
