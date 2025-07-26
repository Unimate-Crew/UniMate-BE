import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { User } from '@app/database/entites/user/user.entity';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { ProductImageRepository } from '@app/database/entites/product-post/product-image.repository';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import {
  TradeStatus,
  CurrencyType,
  ProductCategory,
  TradeType,
} from '@app/database/common/enums';
import { Transactional } from '@mikro-orm/core';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { S3Service } from '@app/common/s3/s3.service';
import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';
import { LikeRepository } from '@app/database/entites/like/like.repository';
import { Slice } from '@app/common/utils/pagination';
import { ProductPostWithRelations } from '@app/database/entites/product-post/dto/product-post-with-relations.dto';
import { UserBlockRepository } from '@app/database/entites/user-block/user-block.repository';
import { CategoryCountDto } from '@app/database/entites/product-post/dto/category-count.dto';
import { Like } from '@app/database/entites/like/like.entity';
import { ProductPostDetailWithRelations } from '@app/database/entites/product-post/dto/product-post-detail-with-relations.dto';
import { ErrorCode } from '../../common/error-code';
import { ProductPostInfo } from './dto/product-post.info';
import { ProductCategoryInfo } from './dto/Product-category.info';
import { ProductPostDetailInfo } from './dto/product-post-detail.info';

@Injectable()
export class ProductPostService {
  constructor(
    private readonly productPostRepository: ProductPostRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
    private readonly userBlockRepository: UserBlockRepository,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 상품 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.regionId 지역 ID
   * @param params.userId 현재 로그인한 유저 ID
   * @returns 페이지네이션된 상품 게시글 목록과 다음 페이지 존재 여부
   */
  async findPagedProductPosts(params: {
    page: number;
    limit: number;
    regionId?: string;
    userId?: number;
  }): Promise<Slice<ProductPostInfo>> {
    // 1. 내가 차단한 유저 목록 조회 (단방향 차단)
    let blockedUserIds: number[] = [];
    if (params.userId) {
      // 내가 차단한 유저만 조회
      const blockedByMe = await this.userBlockRepository.findByBlockerId(
        params.userId,
      );

      blockedUserIds = blockedByMe.map((block) => block.blockedId);
    }

    // 2. 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedProductPosts({
        page: params.page,
        limit: params.limit,
        regionId: params.regionId,
        blockedUserIds,
      });

    // 3. 상품 ID 목록 추출
    const productIds: number[] = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 4. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 5. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos: ProductPostInfo[] = await Promise.all(
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
  async createProductPost(params: {
    title: string;
    imageKeys: string[];
    category: ProductCategory;
    price: number;
    currencyType: CurrencyType;
    description: string;
    tradeType: TradeType;
    tradeTypeDescription: string;
    regionId: string;
    userId: number;
  }): Promise<number> {
    const user: User = await this.userRepository.findById(params.userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'Requested user ID does not match the authenticated user',
      });
    }

    const productPost: ProductPost = this.productPostRepository.create({
      title: params.title,
      category: params.category,
      price: params.price,
      currencyType: params.currencyType,
      description: params.description,
      tradeType: params.tradeType,
      tradeTypeDescription: params.tradeTypeDescription,
      regionId: params.regionId,
      userId: params.userId,
      tradeStatus: TradeStatus.FOR_SALE,
      universityId: user.getUniversityId(),
    });
    await this.productPostRepository.persistAndFlush(productPost);

    const productImages = params.imageKeys.map((imageKey, index) => {
      const productImage: ProductImage = this.productImageRepository.create({
        productId: productPost.getId(),
        imageKey,
        isThumbnail: index === 0,
      });
      return productImage;
    });

    // 3. 이미지들 저장
    await Promise.all(
      productImages.map((productImage) =>
        this.productImageRepository.persistAndFlush(productImage),
      ),
    );

    return productPost.getId();
  }

  async generatePresignedUrlList(
    fileNames: string[],
  ): Promise<PresignedUrlDto[]> {
    return Promise.all(
      fileNames.map(async (fileName) => {
        const { presignedUrl, key } =
          await this.s3Service.generatePutPresignedUrl({
            fileName,
            path: 'product-post',
          });

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
  async searchProductPosts(params: {
    page: number;
    limit: number;
    searchKeyword?: string;
    universityId?: number;
    currencyType?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    tradeStatus?: string;
    sortDirection?: string;
    regionId?: string;
    userId?: number;
  }): Promise<Slice<ProductPostInfo>> {
    // 1. 내가 차단한 유저 목록 조회 (단방향 차단)
    let blockedUserIds: number[] = [];
    if (params.userId) {
      // 내가 차단한 유저만 조회
      const blockedByMe = await this.userBlockRepository.findByBlockerId(
        params.userId,
      );

      blockedUserIds = blockedByMe.map((block) => block.blockedId);
    }

    // 2. 상품 목록 검색 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.searchProductPosts({
        searchKeyword: params.searchKeyword,
        universityId: params.universityId,
        currencyType: params.currencyType,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        category: params.category,
        tradeStatus: params.tradeStatus,
        sortDirection: params.sortDirection,
        page: params.page,
        limit: params.limit,
        regionId: params.regionId,
        blockedUserIds,
      });

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
   * 상품 게시글을 수정합니다.
   *
   * @param params.productPostId 수정할 상품 게시글 ID
   * @param params.userId 현재 로그인한 유저 ID
   * @param params.tradeStatus 거래 상태
   * @param params.title 제목
   * @param params.description 설명
   * @param params.price 가격
   * @param params.currencyType 통화 타입
   * @param params.category 카테고리
   * @param params.tradeType 거래 타입
   * @param params.tradeTypeDescription 거래 타입 설명
   * @returns 수정된 상품 게시글 ID
   */
  @Transactional()
  async updateProductPost(params: {
    productPostId: number;
    userId: number;
    tradeStatus?: TradeStatus;
    title?: string;
    description?: string;
    price?: number;
    currencyType?: CurrencyType;
    category?: ProductCategory;
    tradeType?: TradeType;
    tradeTypeDescription?: string;
  }): Promise<number> {
    // 1. 상품 게시글 조회
    const productPost: ProductPost = await this.productPostRepository.findById(
      params.productPostId,
    );

    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    // 2. 삭제된 게시글인지 확인
    if (productPost.isProductPostDeleted()) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_DELETED,
        message: '삭제된 상품 게시글입니다.',
      });
    }

    // 3. 권한 검증 (본인이 작성한 게시글만 수정 가능)
    if (productPost.getUserId() !== params.userId) {
      throw new ForbiddenException({
        code: ErrorCode.PRODUCT_POST_UPDATE_FORBIDDEN,
        message: '본인이 작성한 상품 게시글만 수정할 수 있습니다.',
      });
    }

    // 4. 상품 게시글 수정
    if (params.tradeStatus !== undefined) {
      productPost.setTradeStatus(params.tradeStatus);
    }

    if (params.title !== undefined) {
      productPost.setTitle(params.title);
    }

    if (params.description !== undefined) {
      productPost.setDescription(params.description);
    }

    if (params.price !== undefined) {
      productPost.setPrice(params.price);
    }

    if (params.currencyType !== undefined) {
      productPost.setCurrencyType(params.currencyType);
    }

    if (params.category !== undefined) {
      productPost.setCategory(params.category);
    }

    if (params.tradeType !== undefined) {
      productPost.setTradeType(params.tradeType);
    }

    if (params.tradeTypeDescription !== undefined) {
      productPost.setTradeTypeDescription(params.tradeTypeDescription);
    }

    // 5. 변경사항 저장
    await this.productPostRepository.persistAndFlush(productPost);

    return productPost.getId();
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

  /**
   * 상품 게시글에 좋아요를 추가합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.userId 좋아요할 사용자 ID
   * @returns 생성된 좋아요 정보
   */
  @Transactional()
  async likeProductPost(params: {
    productPostId: number;
    userId: number;
  }): Promise<void> {
    // 1. 상품 게시글 존재 여부 확인
    const productPost = await this.productPostRepository.findById(
      params.productPostId,
    );
    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    // 2. 이미 좋아요했는지 확인
    const existingLike: Like | null =
      await this.likeRepository.findByProductIdAndUserId({
        productId: params.productPostId,
        userId: params.userId,
      });

    if (existingLike) {
      throw new ConflictException({
        code: ErrorCode.PRODUCT_POST_ALREADY_LIKED,
        message: '이미 좋아요한 상품 게시글입니다.',
      });
    }

    // 3. 좋아요 생성
    const like: Like = this.likeRepository.create({
      productId: params.productPostId,
      userId: params.userId,
    });

    await this.likeRepository.persistAndFlush(like);
  }

  /**
   * 상품 게시글 좋아요 취소
   * @param params.productPostId
   * @param params.userId
   */
  @Transactional()
  async unlikeProductPost(params: {
    productPostId: number;
    userId: number;
  }): Promise<void> {
    await this.likeRepository.deleteByProductIdAndUserId({
      productId: params.productPostId,
      userId: params.userId,
    });
  }

  /**
   * 상품 게시글 상세 정보를 조회합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.userId 현재 로그인한 유저 ID
   * @returns 상품 게시글 상세 정보
   */
  async findProductPostDetail(params: {
    productPostId: number;
    userId?: number;
  }): Promise<ProductPostDetailInfo> {
    // 1. 상품 게시글 상세 정보 조회
    const productPostDetail: ProductPostDetailWithRelations =
      await this.productPostRepository.findProductPostDetail(
        params.productPostId,
      );
    if (!productPostDetail) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: 'Product post not found',
      });
    }

    // 2. 이미지 URL들을 Presigned URL로 변환
    const imageUrls = await Promise.all(
      productPostDetail.imageKeys.map((imageKey) =>
        this.s3Service.generateGetPresignedUrl(imageKey),
      ),
    );

    // 3. 좋아요 수 조회
    const likeCount: number = await this.likeRepository.countByProductId(
      params.productPostId,
    );

    // 4. 좋아요 여부 조회 (로그인한 유저인 경우)
    let isLiked = false;
    if (params.userId) {
      const like: Like = await this.likeRepository.findByProductIdAndUserId({
        productId: params.productPostId,
        userId: params.userId,
      });
      isLiked = like !== null;
    }

    // 5. 판매자 프로필 이미지 URL 생성
    let sellerProfileImageUrl: string | null = null;
    if (productPostDetail.sellerProfileImageKey) {
      sellerProfileImageUrl = await this.s3Service.generateGetPresignedUrl(
        productPostDetail.sellerProfileImageKey,
      );
    }

    // 6. 상품 게시글 주인 여부 확인
    const isOwner = productPostDetail.productPost.isOwner(params.userId);

    return ProductPostDetailInfo.of(
      productPostDetail,
      imageUrls,
      isLiked,
      likeCount,
      0, // TODO: 채팅방 수 구현
      isOwner,
      sellerProfileImageUrl,
    );
  }
}
