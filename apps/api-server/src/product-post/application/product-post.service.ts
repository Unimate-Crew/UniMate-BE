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
  MySalesFilter,
  UserSalesFilter,
} from '@app/database/common/enums';
import { Transactional } from '@mikro-orm/core';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { S3Service } from '@app/common/s3/s3.service';
import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';
import { LikeRepository } from '@app/database/entites/like/like.repository';
import { Slice, PageRequest, ErrorCode } from '@app/common';
import { ProductPostWithRelations } from '@app/database/entites/product-post/dto/product-post-with-relations.dto';
import { UserBlockRepository } from '@app/database/entites/user-block/user-block.repository';
import { CategoryCountDto } from '@app/database/entites/product-post/dto/category-count.dto';
import { Like } from '@app/database/entites/like/like.entity';
import { ProductPostDetailWithRelations } from '@app/database/entites/product-post/dto/product-post-detail-with-relations.dto';
import { InterestRegionRepository } from '@app/database/entites/interest-region/interest-region.repository';
import { InterestRegion } from '@app/database/entites/interest-region/interest-region.entity';
import { ConversationRepository } from '@app/database/entites/conversation/conversation.repository';
import { ProductPostResultDto } from './dto/product-post.result.dto';
import { ProductCategoryResultDto } from './dto/Product-category.result.dto';
import { ProductPostDetailResultDto } from './dto/product-post-detail.result.dto';

@Injectable()
export class ProductPostService {
  constructor(
    private readonly productPostRepository: ProductPostRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
    private readonly userBlockRepository: UserBlockRepository,
    private readonly interestRegionRepository: InterestRegionRepository,
    private readonly conversationRepository: ConversationRepository,
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
    pageRequest: PageRequest;
    regionId: string;
    userId?: number;
  }): Promise<Slice<ProductPostResultDto>> {
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
        pageRequest: params.pageRequest,
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

    // 5. 채팅방 수 조회
    const conversationCountMap: Map<number, number> =
      await this.conversationRepository.countByProductIds(productIds);

    // 6. 좋아요 여부 조회 (로그인한 유저인 경우)
    let likedProductIds: Set<number> = new Set();
    if (params.userId) {
      likedProductIds =
        await this.likeRepository.findLikedProductIdsByUserIdAndProductIds(
          params.userId,
          productIds,
        );
    }

    // 7. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos: ProductPostResultDto[] = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostResultDto(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          conversationCountMap.get(post.productPost.getId()) ?? 0,
          likedProductIds.has(post.productPost.getId()),
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
    userId: number;
  }): Promise<number> {
    // 1. 사용자 검증
    const user: User = await this.userRepository.findById(params.userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'Requested user ID does not match the authenticated user',
      });
    }

    // 2. 기본 관심도시 조회
    const primaryInterestRegion: InterestRegion | null =
      await this.interestRegionRepository.findPrimaryByUserId(params.userId);
    if (!primaryInterestRegion) {
      throw new NotFoundException({
        code: ErrorCode.PRIMARY_INTEREST_REGION_NOT_FOUND,
        message: '기본 관심도시가 설정되지 않았습니다.',
      });
    }

    const regionId: string = primaryInterestRegion.getRegion().getId();

    // 3. 상품 게시글 생성
    const productPost: ProductPost = this.productPostRepository.create({
      title: params.title,
      category: params.category,
      price: params.price,
      currencyType: params.currencyType,
      description: params.description,
      tradeType: params.tradeType,
      tradeTypeDescription: params.tradeTypeDescription,
      regionId,
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
    pageRequest: PageRequest;
    searchKeyword?: string;
    universityId?: number;
    currencyType?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    tradeStatus?: string;
    sortDirection?: string;
    regionId: string;
    userId?: number;
  }): Promise<Slice<ProductPostResultDto>> {
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
        pageRequest: params.pageRequest,
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

    // 5. 채팅방 수 조회
    const conversationCountMap: Map<number, number> =
      await this.conversationRepository.countByProductIds(productIds);

    // 6. 좋아요 여부 조회 (로그인한 유저인 경우)
    let likedProductIds: Set<number> = new Set();
    if (params.userId) {
      likedProductIds =
        await this.likeRepository.findLikedProductIdsByUserIdAndProductIds(
          params.userId,
          productIds,
        );
    }

    // 7. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostResultDto(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          conversationCountMap.get(post.productPost.getId()) ?? 0,
          likedProductIds.has(post.productPost.getId()),
        );
      }),
    );

    return Slice.of(productPostInfos, productPostSlice.hasNext);
  }

  /**
   * 내 판매내역 목록을 페이지네이션하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.userId 현재 로그인한 유저 ID
   * @param params.mySalesFilter 판매내역 필터 (옵셔널)
   * @returns 페이지네이션된 내 판매내역 목록과 다음 페이지 존재 여부
   */
  async findMySales(params: {
    pageRequest: PageRequest;
    userId: number;
    mySalesFilter?: MySalesFilter;
  }): Promise<Slice<ProductPostResultDto>> {
    // 1. 필터 파라미터 설정
    let tradeStatus: TradeStatus[] | undefined;
    let isHidden: boolean | undefined;

    if (params.mySalesFilter) {
      switch (params.mySalesFilter) {
        case MySalesFilter.FOR_SALE:
          tradeStatus = [TradeStatus.FOR_SALE, TradeStatus.RESERVED];
          break;
        case MySalesFilter.COMPLETED:
          tradeStatus = [TradeStatus.COMPLETED];
          break;
        case MySalesFilter.HIDDEN:
          isHidden = true;
          break;
        default:
          // 전체 조회 - 필터링 없음
          break;
      }
    }

    // 2. 내가 작성한 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedSales({
        pageRequest: params.pageRequest,
        userId: params.userId,
        tradeStatus,
        isHidden,
      });

    // 3. 상품 ID 목록 추출
    const productIds: number[] = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 4. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 5. 채팅방 수 조회
    const conversationCountMap: Map<number, number> =
      await this.conversationRepository.countByProductIds(productIds);

    // 6. 좋아요 여부 조회
    const likedProductIds: Set<number> =
      await this.likeRepository.findLikedProductIdsByUserIdAndProductIds(
        params.userId,
        productIds,
      );

    // 7. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos: ProductPostResultDto[] = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostResultDto(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          conversationCountMap.get(post.productPost.getId()) ?? 0,
          likedProductIds.has(post.productPost.getId()),
        );
      }),
    );

    return Slice.of(productPostInfos, productPostSlice.hasNext);
  }

  /**
   * 내가 좋아요한 상품게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.userId 현재 로그인한 유저 ID
   * @returns 페이지네이션된 내가 좋아요한 상품게시글 목록과 다음 페이지 존재 여부
   */
  async findMyLikes(params: {
    pageRequest: PageRequest;
    userId: number;
  }): Promise<Slice<ProductPostResultDto>> {
    // 1. 내가 좋아요한 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedLikes({
        pageRequest: params.pageRequest,
        userId: params.userId,
      });

    // 2. 상품 ID 목록 추출
    const productIds: number[] = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 3. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 4. 채팅방 수 조회
    const conversationCountMap: Map<number, number> =
      await this.conversationRepository.countByProductIds(productIds);

    // 5. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    // 내가 좋아요한 목록이므로 모든 게시글의 isLiked는 true
    const productPostInfos: ProductPostResultDto[] = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostResultDto(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          conversationCountMap.get(post.productPost.getId()) ?? 0,
          true, // 내가 좋아요한 목록이므로 항상 true
        );
      }),
    );

    return Slice.of(productPostInfos, productPostSlice.hasNext);
  }

  /**
   * 특정 유저의 판매내역 목록을 페이지네이션하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.userId 조회할 유저 ID
   * @param params.currentUserId 현재 로그인한 유저 ID (좋아요 여부 확인용)
   * @param params.userSalesFilter 판매내역 필터 (옵셔널)
   * @returns 페이지네이션된 유저의 판매내역 목록과 다음 페이지 존재 여부
   */
  async findUserSales(params: {
    pageRequest: PageRequest;
    userId: number;
    currentUserId?: number;
    userSalesFilter?: UserSalesFilter;
  }): Promise<Slice<ProductPostResultDto>> {
    // 1. 필터 파라미터 설정
    let tradeStatus: TradeStatus[] | undefined;
    const isHidden = false; // 다른 유저의 판매내역에서는 숨겨진 게시글 제외

    if (params.userSalesFilter) {
      switch (params.userSalesFilter) {
        case UserSalesFilter.FOR_SALE:
          tradeStatus = [TradeStatus.FOR_SALE, TradeStatus.RESERVED];
          break;
        case UserSalesFilter.COMPLETED:
          tradeStatus = [TradeStatus.COMPLETED];
          break;
        default:
          // 전체 조회 - 필터링 없음
          break;
      }
    }

    // 2. 특정 유저가 작성한 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedSales({
        pageRequest: params.pageRequest,
        userId: params.userId,
        tradeStatus,
        isHidden,
      });

    // 3. 상품 ID 목록 추출
    const productIds: number[] = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 4. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 5. 채팅방 수 조회
    const conversationCountMap: Map<number, number> =
      await this.conversationRepository.countByProductIds(productIds);

    // 6. 좋아요 여부 조회 (로그인한 유저인 경우)
    let likedProductIds: Set<number> = new Set();
    if (params.currentUserId) {
      likedProductIds =
        await this.likeRepository.findLikedProductIdsByUserIdAndProductIds(
          params.currentUserId,
          productIds,
        );
    }

    // 7. ProductPostInfo로 변환 (이미지 키를 PresignedUrl로 변환)
    const productPostInfos: ProductPostResultDto[] = await Promise.all(
      productPostSlice.contents.map(async (post) => {
        let thumbnailUrl = null;
        if (post.thumbnailImageKey) {
          thumbnailUrl = await this.s3Service.generateGetPresignedUrl(
            post.thumbnailImageKey,
          );
        }

        return new ProductPostResultDto(
          post.productPost,
          post.universityName,
          thumbnailUrl,
          likeCountMap.get(post.productPost.getId()) ?? 0,
          conversationCountMap.get(post.productPost.getId()) ?? 0,
          likedProductIds.has(post.productPost.getId()),
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
   * @param params.title 제목
   * @param params.imageKeys 이미지 키 배열 (제공 시 기존 이미지 대체)
   * @param params.category 카테고리
   * @param params.price 가격
   * @param params.currencyType 통화 타입
   * @param params.description 설명
   * @param params.tradeType 거래 타입
   * @param params.tradeTypeDescription 거래 타입 설명
   * @returns 수정된 상품 게시글 ID
   */
  @Transactional()
  async updateProductPost(params: {
    productPostId: number;
    userId: number;
    title?: string;
    imageKeys?: string[];
    category?: ProductCategory;
    price?: number;
    currencyType?: CurrencyType;
    description?: string;
    tradeType?: TradeType;
    tradeTypeDescription?: string;
  }): Promise<number> {
    // 1. 상품 게시글 조회 및 검증
    const productPost = await this.validateProductPostForUpdate(
      params.productPostId,
      params.userId,
    );

    // 2. 상품 게시글 기본 정보 수정
    this.updateProductPostFields(productPost, params);

    // 3. 이미지 수정 (제공된 경우)
    if (params.imageKeys !== undefined && params.imageKeys.length > 0) {
      await this.updateProductPostImages(
        params.productPostId,
        params.imageKeys,
      );
    }

    // 4. 변경사항 저장
    await this.productPostRepository.persistAndFlush(productPost);

    return productPost.getId();
  }

  /**
   * 상품 게시글 수정 권한을 검증합니다.
   *
   * @param productPostId 상품 게시글 ID
   * @param userId 사용자 ID
   * @returns 검증된 상품 게시글
   * @throws NotFoundException 게시글을 찾을 수 없거나 삭제된 경우
   * @throws ForbiddenException 수정 권한이 없는 경우
   */
  private async validateProductPostForUpdate(
    productPostId: number,
    userId: number,
  ): Promise<ProductPost> {
    const productPost =
      await this.productPostRepository.findById(productPostId);

    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    if (productPost.isProductPostDeleted()) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_DELETED,
        message: '삭제된 상품 게시글입니다.',
      });
    }

    if (productPost.getUserId() !== userId) {
      throw new ForbiddenException({
        code: ErrorCode.PRODUCT_POST_UPDATE_FORBIDDEN,
        message: '본인이 작성한 상품 게시글만 수정할 수 있습니다.',
      });
    }

    return productPost;
  }

  /**
   * 상품 게시글의 필드를 업데이트합니다.
   *
   * @param productPost 상품 게시글 엔티티
   * @param params 업데이트할 필드들
   */
  private updateProductPostFields(
    productPost: ProductPost,
    params: {
      title?: string;
      category?: ProductCategory;
      price?: number;
      currencyType?: CurrencyType;
      description?: string;
      tradeType?: TradeType;
      tradeTypeDescription?: string;
    },
  ): void {
    if (params.title !== undefined) {
      productPost.setTitle(params.title);
    }

    if (params.category !== undefined) {
      productPost.setCategory(params.category);
    }

    if (params.price !== undefined) {
      productPost.setPrice(params.price);
    }

    if (params.currencyType !== undefined) {
      productPost.setCurrencyType(params.currencyType);
    }

    if (params.description !== undefined) {
      productPost.setDescription(params.description);
    }

    if (params.tradeType !== undefined) {
      productPost.setTradeType(params.tradeType);
    }

    if (params.tradeTypeDescription !== undefined) {
      productPost.setTradeTypeDescription(params.tradeTypeDescription);
    }
  }

  /**
   * 상품 게시글의 이미지를 업데이트합니다.
   * 기존 이미지를 소프트 삭제하고 새 이미지로 대체합니다.
   *
   * @param productPostId 상품 게시글 ID
   * @param imageKeys 새로운 이미지 키 배열 (첫 번째가 썸네일)
   */
  private async updateProductPostImages(
    productPostId: number,
    imageKeys: string[],
  ): Promise<void> {
    // 1. 기존 이미지 소프트 삭제
    await this.productImageRepository.softDeleteByProductId(productPostId);

    // 2. 새 이미지 생성
    const productImages = imageKeys.map((imageKey, index) =>
      this.productImageRepository.create({
        productId: productPostId,
        imageKey,
        isThumbnail: index === 0,
      }),
    );

    // 3. 이미지 저장
    await Promise.all(
      productImages.map((productImage) =>
        this.productImageRepository.persistAndFlush(productImage),
      ),
    );
  }

  /**
   * 상품 카테고리 목록을 조회합니다.
   * 각 카테고리별 상품 게시글 개수를 포함합니다.
   *
   * @param regionId 지역 ID (옵셔널)
   * @returns 카테고리 목록과 각 카테고리의 상품 개수
   */
  async findCategories(regionId?: string): Promise<ProductCategoryResultDto[]> {
    const categoryCounts: CategoryCountDto[] =
      await this.productPostRepository.findCategoryCounts(regionId);

    return ProductCategoryResultDto.of(categoryCounts);
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
  }): Promise<ProductPostDetailResultDto> {
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

    return ProductPostDetailResultDto.of(
      productPostDetail,
      imageUrls,
      isLiked,
      likeCount,
      0, // TODO: 채팅방 수 구현
      isOwner,
      sellerProfileImageUrl,
    );
  }

  /**
   * 상품 게시글을 숨김 처리합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.userId 현재 로그인한 유저 ID
   */
  @Transactional()
  async hideProductPost(params: {
    productPostId: number;
    userId: number;
  }): Promise<void> {
    // 1. 상품 게시글 조회
    const productPost = await this.productPostRepository.findById(
      params.productPostId,
    );
    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    // 2. 본인이 작성한 게시글인지 확인
    if (!productPost.isOwner(params.userId)) {
      throw new ForbiddenException({
        code: ErrorCode.PRODUCT_POST_UPDATE_FORBIDDEN,
        message: '본인이 작성한 상품 게시글만 숨길 수 있습니다.',
      });
    }

    // 3. 예약중인 게시글인지 확인
    if (productPost.isReserved()) {
      throw new ConflictException({
        code: ErrorCode.PRODUCT_POST_RESERVED_CANNOT_HIDE,
        message: '예약중인 상품 게시글은 숨길 수 없습니다.',
      });
    }

    // 4. 이미 숨김 처리된 게시글인지 확인
    if (productPost.getIsHidden()) {
      throw new ConflictException({
        code: ErrorCode.PRODUCT_POST_ALREADY_HIDDEN,
        message: '이미 숨김 처리된 상품 게시글입니다.',
      });
    }

    // 5. 숨김 처리
    productPost.setIsHidden(true);
    await this.productPostRepository.persistAndFlush(productPost);
  }

  /**
   * 상품 게시글 숨김을 해제합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.userId 현재 로그인한 유저 ID
   */
  @Transactional()
  async unhideProductPost(params: {
    productPostId: number;
    userId: number;
  }): Promise<void> {
    // 1. 상품 게시글 조회
    const productPost = await this.productPostRepository.findById(
      params.productPostId,
    );
    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    // 2. 본인이 작성한 게시글인지 확인
    if (!productPost.isOwner(params.userId)) {
      throw new ForbiddenException({
        code: ErrorCode.PRODUCT_POST_UPDATE_FORBIDDEN,
        message: '본인이 작성한 상품 게시글만 숨김 해제할 수 있습니다.',
      });
    }

    // 3. 숨김 처리되지 않은 게시글인지 확인
    if (!productPost.getIsHidden()) {
      throw new ConflictException({
        code: ErrorCode.PRODUCT_POST_NOT_HIDDEN,
        message: '숨김 처리되지 않은 상품 게시글입니다.',
      });
    }

    // 4. 숨김 해제
    productPost.setIsHidden(false);
    await this.productPostRepository.persistAndFlush(productPost);
  }

  /**
   * 상품 게시글을 삭제합니다.
   *
   * @param params.productPostId 상품 게시글 ID
   * @param params.userId 현재 로그인한 유저 ID
   */
  @Transactional()
  async deleteProductPost(params: {
    productPostId: number;
    userId: number;
  }): Promise<void> {
    const productPost: ProductPost | null =
      await this.productPostRepository.findById(params.productPostId);

    if (!productPost) {
      throw new NotFoundException({
        code: ErrorCode.PRODUCT_POST_NOT_FOUND,
        message: '상품 게시글을 찾을 수 없습니다.',
      });
    }

    if (!productPost.isOwner(params.userId)) {
      throw new ForbiddenException({
        code: ErrorCode.PRODUCT_POST_UPDATE_FORBIDDEN,
        message: '본인이 작성한 상품 게시글만 삭제할 수 있습니다.',
      });
    }

    await this.productImageRepository.softDeleteByProductId(
      productPost.getId(),
    );

    // 5. 게시글 소프트 삭제
    productPost.delete();
    await this.productPostRepository.persistAndFlush(productPost);
  }
}
