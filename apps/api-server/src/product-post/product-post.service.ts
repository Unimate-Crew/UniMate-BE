import { Injectable } from '@nestjs/common';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { ProductPostItemDto } from './dto/get-product-posts-response.dto';

@Injectable()
export class ProductPostService {
  constructor(private readonly productPostRepository: ProductPostRepository) {}

  /**
   * 상품 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param pageNumber 페이지 번호 (0부터 시작)
   * @param pageSize 페이지 크기
   * @param regionId 필터링할 지역 ID (optional)
   * @returns 페이지네이션된 상품 게시글 목록과 다음 페이지 존재 여부
   */
  async getProductPosts(
    pageNumber: number,
    pageSize: number,
    regionId?: number,
  ): Promise<{ content: ProductPostItemDto[]; hasNext: boolean }> {
    // 실제 구현 시에는 데이터베이스에서 조회하는 로직으로 변경 필요
    // 현재는 임시 데이터 반환

    // 필터링 로직 예시
    let mockProductPosts = this.getMockProductPosts();
    if (regionId) {
      // 실제로는 데이터베이스 쿼리에서 필터링하겠지만, 여기서는 모의 데이터를 필터링
      mockProductPosts = mockProductPosts.filter(
        (productPost) => productPost.regionId === regionId,
      );
    }

    const totalElements = mockProductPosts.length;
    const startIndex = pageNumber * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalElements);
    const paginatedProductPosts = mockProductPosts.slice(startIndex, endIndex);

    // 다음 페이지 존재 여부 확인
    const hasNext = endIndex < totalElements;

    return {
      content: paginatedProductPosts,
      hasNext,
    };
  }

  /**
   * 모의 상품 게시글 데이터를 생성합니다.
   * 실제 구현에서는 필요 없는 메서드입니다.
   */
  private getMockProductPosts(): (ProductPostItemDto & { regionId: number })[] {
    return [];
  }
}
