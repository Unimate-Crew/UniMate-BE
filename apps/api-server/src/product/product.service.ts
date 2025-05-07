import { Injectable } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  /**
   * 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param pageNumber 페이지 번호 (0부터 시작)
   * @param pageSize 페이지 크기
   * @param cityId 필터링할 도시 ID (optional)
   * @returns 페이지네이션된 게시글 목록과 다음 페이지 존재 여부
   */
  async getProducts(
    pageNumber: number,
    pageSize: number,
    cityId?: number,
  ): Promise<{ content: ProductDto[]; hasNext: boolean }> {
    // 실제 구현 시에는 데이터베이스에서 조회하는 로직으로 변경 필요
    // 현재는 임시 데이터 반환

    // 필터링 로직 예시
    let mockProducts = this.getMockProducts();
    if (cityId) {
      // 실제로는 데이터베이스 쿼리에서 필터링하겠지만, 여기서는 모의 데이터를 필터링
      mockProducts = mockProducts.filter(
        (product) => product.cityId === cityId,
      );
    }

    const totalElements = mockProducts.length;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedProducts = mockProducts.slice(startIndex, endIndex);

    // 다음 페이지 존재 여부 확인
    const hasNext = endIndex < totalElements;

    return {
      content: paginatedProducts,
      hasNext,
    };
  }

  /**
   * 모의 게시글 데이터를 생성합니다.
   * 실제 구현에서는 필요 없는 메서드입니다.
   */
  private getMockProducts(): (ProductDto & { cityId: number })[] {
    return [];
  }
}
