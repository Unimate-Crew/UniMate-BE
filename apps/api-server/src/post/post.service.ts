import { Injectable } from '@nestjs/common';
import { PostItemDto, CurrencyType } from './dto/get-posts-response.dto';

@Injectable()
export class PostService {
  /**
   * 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param pageNumber 페이지 번호 (0부터 시작)
   * @param pageSize 페이지 크기
   * @param cityId 필터링할 도시 ID (optional)
   * @returns 페이지네이션된 게시글 목록과 다음 페이지 존재 여부
   */
  async getPosts(
    pageNumber: number,
    pageSize: number,
    cityId?: number,
  ): Promise<{ content: PostItemDto[]; hasNext: boolean }> {
    // 실제 구현 시에는 데이터베이스에서 조회하는 로직으로 변경 필요
    // 현재는 임시 데이터 반환

    // 필터링 로직 예시
    let mockPosts = this.getMockPosts();
    if (cityId) {
      // 실제로는 데이터베이스 쿼리에서 필터링하겠지만, 여기서는 모의 데이터를 필터링
      mockPosts = mockPosts.filter((post) => post.cityId === cityId);
    }

    const totalElements = mockPosts.length;
    const startIndex = pageNumber * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalElements);
    const paginatedPosts = mockPosts.slice(startIndex, endIndex);

    // 다음 페이지 존재 여부 확인
    const hasNext = endIndex < totalElements;

    return {
      content: paginatedPosts,
      hasNext,
    };
  }

  /**
   * 모의 게시글 데이터를 생성합니다.
   * 실제 구현에서는 필요 없는 메서드입니다.
   */
  private getMockPosts(): (PostItemDto & { cityId: number })[] {
    return [
      {
        id: 1,
        title: '뉴욕 여행 가이드북 팝니다',
        createdAt: '2023-06-15T09:30:00.000Z',
        universityName: '서울대학교',
        thumbnailUrl: 'https://example.com/images/post1.jpg',
        price: 15000,
        currencyType: CurrencyType.KRW,
        likeCount: 24,
        commentCount: 5,
        cityId: 1, // 뉴욕
      },
      {
        id: 2,
        title: '로마 여행 필수 아이템 판매합니다',
        createdAt: '2023-06-14T10:45:00.000Z',
        universityName: '연세대학교',
        thumbnailUrl: 'https://example.com/images/post2.jpg',
        price: 30000,
        currencyType: CurrencyType.KRW,
        likeCount: 15,
        commentCount: 3,
        cityId: 2, // 로마
      },
      {
        id: 3,
        title: '파리 현지 가이드 구합니다',
        createdAt: '2023-06-13T11:20:00.000Z',
        universityName: '고려대학교',
        thumbnailUrl: 'https://example.com/images/post3.jpg',
        price: 50,
        currencyType: CurrencyType.EUR,
        likeCount: 32,
        commentCount: 8,
        cityId: 3, // 파리
      },
      {
        id: 4,
        title: '런던 한 달 살기 팁 공유',
        createdAt: '2023-06-12T13:15:00.000Z',
        universityName: '서강대학교',
        thumbnailUrl: 'https://example.com/images/post4.jpg',
        price: 10000,
        currencyType: CurrencyType.KRW,
        likeCount: 41,
        commentCount: 12,
        cityId: 4, // 런던
      },
      {
        id: 5,
        title: '도쿄 숙소 양도합니다',
        createdAt: '2023-06-11T14:30:00.000Z',
        universityName: '이화여자대학교',
        thumbnailUrl: 'https://example.com/images/post5.jpg',
        price: 200000,
        currencyType: CurrencyType.KRW,
        likeCount: 19,
        commentCount: 4,
        cityId: 5, // 도쿄
      },
    ];
  }
}
