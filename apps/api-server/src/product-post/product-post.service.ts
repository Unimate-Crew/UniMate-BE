import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { User } from '@app/database/entites/user/user.entity';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { ProductImageRepository } from '@app/database/entites/product-post/product-image.repository';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import { TradeStatus } from '@app/database/common/enums';
import { Transactional } from '@mikro-orm/core';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { CreateProductPostDto } from './dto/create-product-post.dto';
import { ProductPostItemDto } from './dto/get-product-posts-response.dto';
import { ErrorCode } from '../common/error-code';

@Injectable()
export class ProductPostService {
  constructor(
    private readonly productPostRepository: ProductPostRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly userRepository: UserRepository,
  ) {}

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
    regionId?: string,
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
  private getMockProductPosts(): (ProductPostItemDto & { regionId: string })[] {
    return [];
  }

  @Transactional()
  async createProductPost(
    createProductPostDto: CreateProductPostDto,
    userId: number,
  ): Promise<number> {
    const user: User = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'Requested user ID does not match the authenticated user',
      });
    }

    const productPost: ProductPost = this.productPostRepository.create({
      ...createProductPostDto,
      userId,
      tradeStatus: TradeStatus.FOR_SALE,
      universityId: user.getUniversityId(),
    });
    await this.productPostRepository.persistAndFlush(productPost);

    const productImages = createProductPostDto.imageUrls.map(
      (imageUrl, index) => {
        const productImage: ProductImage = this.productImageRepository.create({
          productId: productPost.getId(),
          imageUrl,
          isThumbnail: index === 0,
        });
        return productImage;
      },
    );

    // 3. 이미지들 저장
    await Promise.all(
      productImages.map((productImage) =>
        this.productImageRepository.persistAndFlush(productImage),
      ),
    );

    return productPost.getId();
  }
}
