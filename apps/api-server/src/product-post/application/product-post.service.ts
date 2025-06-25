import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { User } from '@app/database/entites/user/user.entity';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { ProductImageRepository } from '@app/database/entites/product-post/product-image.repository';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import { TradeStatus, ProductCategory } from '@app/database/common/enums';
import { Transactional } from '@mikro-orm/core';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@app/common/s3/s3.service';
import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';
import { LikeRepository } from '@app/database/entites/like/like.repository';
import { Slice } from '@app/common/utils/pagination';
import { ProductPostWithRelations } from '@app/database/entites/product-post/dto/product-post-with-relations.dto';
import { UserBlockRepository } from '@app/database/entites/user-block/user-block.repository';
import { CategoryCountDto } from '@app/database/entites/product-post/dto/category-count.dto';
import { ErrorCode } from '../../common/error-code';
import { CreateProductPostParam } from './dto/create-product-post.param';
import { ProductPostInfo } from './dto/product-post.info';
import { GeneratePresignedUrlParam } from './dto/generate-presigned-url.param';
import { ProductCategoryInfo } from './dto/Product-category.info';

@Injectable()
export class ProductPostService {
  constructor(
    private readonly productPostRepository: ProductPostRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
    private readonly userBlockRepository: UserBlockRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 상품 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param page 페이지 번호 (1부터 시작)
   * @param limit 페이지 크기
   * @param regionId 지역 ID
   * @param userId 현재 로그인한 유저 ID
   * @returns 페이지네이션된 상품 게시글 목록과 다음 페이지 존재 여부
   */
  async findPagedProductPosts(
    page: number,
    limit: number,
    regionId?: string,
    userId?: number,
  ): Promise<Slice<ProductPostInfo>> {
    // 1. 내가 차단한 유저 목록 조회 (단방향 차단)
    let blockedUserIds: number[] = [];
    if (userId) {
      // 내가 차단한 유저만 조회
      const blockedByMe =
        await this.userBlockRepository.findByBlockerId(userId);

      blockedUserIds = blockedByMe.map((block) => block.blockedId);
    }

    // 2. 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedProductPosts(
        page,
        limit,
        regionId,
        blockedUserIds,
      );

    // 3. 상품 ID 목록 추출
    const productIds = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 4. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 5. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostInfo(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          0, // TODO: 채팅방 수 구현
        );
      }),
    );

    return Slice.of(productPostInfos, productPostSlice.hasNext);
  }

  @Transactional()
  async createProductPost(
    createProductPostParam: CreateProductPostParam,
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
      ...createProductPostParam,
      userId,
      tradeStatus: TradeStatus.FOR_SALE,
      universityId: user.getUniversityId(),
    });
    await this.productPostRepository.persistAndFlush(productPost);

    const productImages = createProductPostParam.imageKeys.map(
      (imageKey, index) => {
        const productImage: ProductImage = this.productImageRepository.create({
          productId: productPost.getId(),
          imageKey,
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

  async generatePresignedUrlList(
    generatePresignedUrlParam: GeneratePresignedUrlParam,
  ): Promise<PresignedUrlDto[]> {
    return Promise.all(
      generatePresignedUrlParam.fileNames.map(async (fileName) => {
        const key = `${this.configService.get<string>('NODE_ENV', 'development')}/product/${Date.now()}-${fileName}`;
        const presignedUrl = await this.s3Service.generatePutPresignedUrl(key);

        return PresignedUrlDto.of(presignedUrl, key);
      }),
    );
  }

  /**
   * 상품 게시글을 검색 조건에 따라 페이지네이션하여 조회합니다.
   *
   * @param page 페이지 번호 (1부터 시작)
   * @param limit 페이지 크기
   * @param searchKeyword 검색 키워드
   * @param universityId 대학교 ID
   * @param currencyType 통화 타입
   * @param minPrice 최소 가격
   * @param maxPrice 최대 가격
   * @param category 상품 카테고리
   * @param tradeStatus 거래 상태
   * @param sortDirection 정렬 방향
   * @param regionId 지역 ID
   * @param userId 현재 로그인한 유저 ID
   * @returns 페이지네이션된 상품 게시글 목록과 다음 페이지 존재 여부
   */
  async searchProductPosts(
    page: number,
    limit: number,
    searchKeyword?: string,
    universityId?: number,
    currencyType?: string,
    minPrice?: number,
    maxPrice?: number,
    category?: string,
    tradeStatus?: string,
    sortDirection?: string,
    regionId?: string,
    userId?: number,
  ): Promise<Slice<ProductPostInfo>> {
    // 1. 내가 차단한 유저 목록 조회 (단방향 차단)
    let blockedUserIds: number[] = [];
    if (userId) {
      // 내가 차단한 유저만 조회
      const blockedByMe =
        await this.userBlockRepository.findByBlockerId(userId);

      blockedUserIds = blockedByMe.map((block) => block.blockedId);
    }

    // 2. 상품 목록 검색 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.searchProductPosts(
        searchKeyword,
        universityId,
        currencyType,
        minPrice,
        maxPrice,
        category,
        tradeStatus,
        sortDirection,
        page,
        limit,
        regionId,
        blockedUserIds,
      );

    // 3. 상품 ID 목록 추출
    const productIds = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 4. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 5. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostInfo(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          0, // TODO: 채팅방 수 구현
        );
      }),
    );

    return Slice.of(productPostInfos, productPostSlice.hasNext);
  }

  /**
   * 상품 카테고리 목록을 조회합니다.
   * 각 카테고리별 상품 게시글 개수를 포함합니다.
   *
   * @param regionId 지역 ID (옵셔널)
   * @returns 카테고리 목록과 각 카테고리의 상품 개수
   */
  async findCategories(regionId?: string): Promise<ProductCategoryInfo[]> {
    const categoryCounts: CategoryCountDto[] =
      await this.productPostRepository.findCategoryCounts(regionId);

    return ProductCategoryInfo.of(categoryCounts);
  }
}
