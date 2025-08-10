import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Slice, PageRequest } from '@app/common';
import { TradeStatus, ProductCategory } from '../../common/enums';
// eslint-disable-next-line import/no-cycle
import { ProductPost } from './product-post.entity';
import { ProductPostWithRelations } from './dto/product-post-with-relations.dto';
import { CategoryCountDto } from './dto/category-count.dto';
import { ProductPostDetailWithRelations } from './dto/product-post-detail-with-relations.dto';

@Injectable()
export class ProductPostRepository extends EntityRepository<ProductPost> {
  async findById(id: number): Promise<ProductPost | null> {
    return this.findOne({ id, isDeleted: false });
  }

  /**
   * 상품 게시글 상세 정보를 조회합니다.
   * 판매자 정보와 이미지 정보를 포함하여 조회합니다.
   *
   * @param id 상품 게시글 ID
   * @returns 상품 게시글과 관련 정보
   */
  async findProductPostDetail(
    id: number,
  ): Promise<ProductPostDetailWithRelations | null> {
    const knex = this.em.getKnex();

    const result = await knex
      .select([
        'product_post.*',
        'user.id as seller_id',
        'user.nickname as seller_nickname',
        'user.profile_image_key as seller_profile_image_key',
      ])
      .from('product_post')
      .leftJoin('user', 'product_post.user_id', 'user.id')
      .where('product_post.id', id)
      .where('product_post.is_deleted', false)
      .first();

    if (!result) {
      return null;
    }

    // 이미지 키들 조회
    const imageKeys = await knex
      .select('image_key')
      .from('product_image')
      .where('product_id', id)
      .where('is_deleted', false)
      .orderBy('is_thumbnail', 'desc')
      .orderBy('id', 'asc');

    const productPost = this.em.map(ProductPost, {
      id: result.id,
      title: result.title,
      description: result.description,
      userId: result.user_id,
      price: result.price,
      currencyType: result.currency_type,
      category: result.category,
      tradeStatus: result.trade_status,
      tradeType: result.trade_type,
      tradeTypeDescription: result.trade_type_description,
      regionId: result.region_id,
      universityId: result.university_id,
      isDeleted: result.is_deleted,
      isHidden: result.is_hidden,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      deletedAt: result.deleted_at,
    });

    return ProductPostDetailWithRelations.of({
      productPost,
      sellerId: result.seller_id,
      sellerNickname: result.seller_nickname,
      sellerProfileImageKey: result.seller_profile_image_key,
      imageKeys: imageKeys.map((img) => img.image_key),
    });
  }

  async findByUserId(userId: number): Promise<ProductPost[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findByRegionId(regionId: string): Promise<ProductPost[]> {
    return this.find({ regionId, isDeleted: false });
  }

  async findByUniversityId(universityId: number): Promise<ProductPost[]> {
    return this.find({ universityId, isDeleted: false });
  }

  async findByTradeStatus(tradeStatus: TradeStatus): Promise<ProductPost[]> {
    return this.find({ tradeStatus, isDeleted: false });
  }

  async findByCategory(category: ProductCategory): Promise<ProductPost[]> {
    return this.find({ category, isDeleted: false });
  }

  async findAllActive(): Promise<ProductPost[]> {
    return this.find({ isDeleted: false });
  }

  async persist(productPost: ProductPost): Promise<void> {
    await this.em.persist(productPost);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(productPost: ProductPost): Promise<void> {
    await this.em.persistAndFlush(productPost);
  }

  /**
   * 페이지네이션된 상품 목록을 조회합니다.
   * 대학교 정보와 썸네일 URL을 포함하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.regionId 지역 ID
   * @param params.blockedUserIds 차단된 유저 ID 목록
   * @returns Slice<ProductPostWithRelations>
   */
  async findPagedProductPosts(params: {
    pageRequest: PageRequest;
    regionId: string;
    blockedUserIds?: number[];
  }): Promise<Slice<ProductPostWithRelations>> {
    const knex = this.em.getKnex();

    const query = knex
      .select([
        'product_post.*',
        'university.name as university_name',
        'product_image.image_key as thumbnail_image_key',
      ])
      .from('product_post')
      .leftJoin('university', 'product_post.university_id', 'university.id')
      .leftJoin('product_image', function () {
        this.on('product_post.id', '=', 'product_image.product_id')
          .andOn('product_image.is_thumbnail', '=', knex.raw('?', [true]))
          .andOn('product_image.is_deleted', '=', knex.raw('?', [false]));
      })
      .where('product_post.is_deleted', false)
      .where('product_post.is_hidden', false);

    if (params.regionId) {
      query.where('product_post.region_id', params.regionId);
    }

    // 차단된 유저의 게시글 제외
    if (params.blockedUserIds && params.blockedUserIds.length > 0) {
      query.whereNotIn('product_post.user_id', params.blockedUserIds);
    }

    const results = await query
      .orderBy('product_post.created_at', 'desc')
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset());

    const hasNext = results.length > params.pageRequest.getLimit();
    const posts = hasNext ? results.slice(0, -1) : results;

    // ProductPostWithRelations DTO로 변환
    const content = posts.map(
      (row) =>
        new ProductPostWithRelations({
          productPost: this.em.map(ProductPost, {
            id: row.id,
            title: row.title,
            description: row.description,
            userId: row.user_id,
            price: row.price,
            currencyType: row.currency_type,
            category: row.category,
            tradeStatus: row.trade_status,
            tradeType: row.trade_type,
            tradeTypeDescription: row.trade_type_description,
            regionId: row.region_id,
            universityId: row.university_id,
            isDeleted: row.is_deleted,
            isHidden: row.is_hidden,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          }),
          universityName: row.university_name,
          thumbnailImageKey: row.thumbnail_image_key,
        }),
    );

    return Slice.of(content, hasNext);
  }

  /**
   * 검색 조건에 따라 페이지네이션된 상품 목록을 조회합니다.
   * 대학교 정보와 썸네일 URL을 포함하여 조회합니다.
   *
   * @param params.searchKeyword 검색 키워드
   * @param params.universityId 대학교 ID
   * @param params.currencyType 통화 타입
   * @param params.minPrice 최소 가격
   * @param params.maxPrice 최대 가격
   * @param params.category 상품 카테고리
   * @param params.tradeStatus 거래 상태
   * @param params.sortDirection 정렬 방향
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.regionId 지역 ID
   * @param params.blockedUserIds 차단된 유저 ID 목록
   * @returns Slice<ProductPostWithRelations>
   */
  async searchProductPosts(params: {
    searchKeyword?: string;
    universityId?: number;
    currencyType?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    tradeStatus?: string;
    sortDirection?: string;
    pageRequest: PageRequest;
    regionId: string;
    blockedUserIds?: number[];
  }): Promise<Slice<ProductPostWithRelations>> {
    const knex = this.em.getKnex();

    const query = knex
      .select([
        'product_post.*',
        'university.name as university_name',
        'product_image.image_key as thumbnail_image_key',
      ])
      .from('product_post')
      .leftJoin('university', 'product_post.university_id', 'university.id')
      .leftJoin('product_image', function () {
        this.on('product_post.id', '=', 'product_image.product_id')
          .andOn('product_image.is_thumbnail', '=', knex.raw('?', [true]))
          .andOn('product_image.is_deleted', '=', knex.raw('?', [false]));
      })
      .where('product_post.is_deleted', false)
      .where('product_post.is_hidden', false);

    // 검색 키워드로 제목 검색
    if (params.searchKeyword) {
      query.where('product_post.title', 'like', `%${params.searchKeyword}%`);
    }

    // 대학교 필터링
    if (params.universityId) {
      query.where('product_post.university_id', params.universityId);
    }

    // 통화 타입 필터링
    if (params.currencyType) {
      query.where('product_post.currency_type', params.currencyType);
    }

    // 가격 범위 필터링
    if (params.minPrice) {
      query.where('product_post.price', '>=', params.minPrice);
    }
    if (params.maxPrice) {
      query.where('product_post.price', '<=', params.maxPrice);
    }

    // 카테고리 필터링
    if (params.category) {
      query.where('product_post.category', params.category);
    }

    // 거래 상태 필터링
    if (params.tradeStatus) {
      query.where('product_post.trade_status', params.tradeStatus);
    }

    // 지역 필터링
    if (params.regionId) {
      query.where('product_post.region_id', params.regionId);
    }

    // 차단된 유저의 게시글 제외
    if (params.blockedUserIds && params.blockedUserIds.length > 0) {
      query.whereNotIn('product_post.user_id', params.blockedUserIds);
    }

    const results = await query
      .orderBy('product_post.created_at', params.sortDirection?.toLowerCase())
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset());

    const hasNext = results.length > params.pageRequest.getLimit();
    const posts = hasNext ? results.slice(0, -1) : results;

    // ProductPostWithRelations DTO로 변환
    const content = posts.map(
      (row) =>
        new ProductPostWithRelations({
          productPost: this.em.map(ProductPost, {
            id: row.id,
            title: row.title,
            description: row.description,
            userId: row.user_id,
            price: row.price,
            currencyType: row.currency_type,
            category: row.category,
            tradeStatus: row.trade_status,
            tradeType: row.trade_type,
            tradeTypeDescription: row.trade_type_description,
            regionId: row.region_id,
            universityId: row.university_id,
            isDeleted: row.is_deleted,
            isHidden: row.is_hidden,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          }),
          universityName: row.university_name,
          thumbnailImageKey: row.thumbnail_image_key,
        }),
    );

    return Slice.of(content, hasNext);
  }

  /**
   * 내가 작성한 상품 게시글 목록을 페이지네이션하여 조회합니다.
   * 대학교 정보와 썸네일 URL을 포함하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.userId 유저 ID
   * @param params.tradeStatus 거래 상태 필터 (옵셔널)
   * @returns Slice<ProductPostWithRelations>
   */
  async findPagedSales(params: {
    pageRequest: PageRequest;
    userId: number;
    tradeStatus?: TradeStatus[];
    isHidden?: boolean;
  }): Promise<Slice<ProductPostWithRelations>> {
    const knex = this.em.getKnex();

    const query = knex
      .select([
        'product_post.*',
        'university.name as university_name',
        'product_image.image_key as thumbnail_image_key',
      ])
      .from('product_post')
      .leftJoin('university', 'product_post.university_id', 'university.id')
      .leftJoin('product_image', function () {
        this.on('product_post.id', '=', 'product_image.product_id')
          .andOn('product_image.is_thumbnail', '=', knex.raw('?', [true]))
          .andOn('product_image.is_deleted', '=', knex.raw('?', [false]));
      })
      .where('product_post.is_deleted', false)
      .where('product_post.user_id', params.userId);

    // 거래 상태 필터링
    if (params.tradeStatus !== undefined) {
      query.whereIn('product_post.trade_status', params.tradeStatus);
    }

    // 숨김 여부 필터링
    if (params.isHidden !== undefined) {
      query.where('product_post.is_hidden', params.isHidden);
    }

    const results = await query
      .orderBy('product_post.created_at', 'desc')
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset());

    const hasNext = results.length > params.pageRequest.getLimit();
    const posts = hasNext ? results.slice(0, -1) : results;

    // ProductPostWithRelations DTO로 변환
    const content = posts.map(
      (row) =>
        new ProductPostWithRelations({
          productPost: this.em.map(ProductPost, {
            id: row.id,
            title: row.title,
            description: row.description,
            userId: row.user_id,
            price: row.price,
            currencyType: row.currency_type,
            category: row.category,
            tradeStatus: row.trade_status,
            tradeType: row.trade_type,
            tradeTypeDescription: row.trade_type_description,
            regionId: row.region_id,
            universityId: row.university_id,
            isDeleted: row.is_deleted,
            isHidden: row.is_hidden,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          }),
          universityName: row.university_name,
          thumbnailImageKey: row.thumbnail_image_key,
        }),
    );

    return Slice.of(content, hasNext);
  }

  /**
   * 내가 좋아요한 상품게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param params.page 페이지 번호 (1부터 시작)
   * @param params.limit 페이지 크기
   * @param params.userId 현재 로그인한 유저 ID
   * @returns 페이지네이션된 내가 좋아요한 상품게시글 목록과 다음 페이지 존재 여부
   */
  async findPagedLikes(params: {
    pageRequest: PageRequest;
    userId: number;
  }): Promise<Slice<ProductPostWithRelations>> {
    const knex = this.em.getKnex();

    const query = knex
      .select([
        'product_post.*',
        'university.name as university_name',
        'product_image.image_key as thumbnail_image_key',
      ])
      .from('product_post')
      .leftJoin('university', 'product_post.university_id', 'university.id')
      .leftJoin('product_image', function () {
        this.on('product_post.id', '=', 'product_image.product_id')
          .andOn('product_image.is_thumbnail', '=', knex.raw('?', [true]))
          .andOn('product_image.is_deleted', '=', knex.raw('?', [false]));
      })
      .leftJoin('like', 'product_post.id', 'like.product_id')
      .where('product_post.is_deleted', false)
      .where('product_post.is_hidden', false) // 숨겨진 게시글은 제외
      .where('like.user_id', params.userId);

    const results = await query
      .orderBy('product_post.created_at', 'desc')
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset());

    const hasNext = results.length > params.pageRequest.getLimit();
    const posts = hasNext ? results.slice(0, -1) : results;

    // ProductPostWithRelations DTO로 변환
    const content = posts.map(
      (row) =>
        new ProductPostWithRelations({
          productPost: this.em.map(ProductPost, {
            id: row.id,
            title: row.title,
            description: row.description,
            userId: row.user_id,
            price: row.price,
            currencyType: row.currency_type,
            category: row.category,
            tradeStatus: row.trade_status,
            tradeType: row.trade_type,
            tradeTypeDescription: row.trade_type_description,
            regionId: row.region_id,
            universityId: row.university_id,
            isDeleted: row.is_deleted,
            isHidden: row.is_hidden,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          }),
          universityName: row.university_name,
          thumbnailImageKey: row.thumbnail_image_key,
        }),
    );

    return Slice.of(content, hasNext);
  }

  /**
   * 카테고리별 상품 게시글 개수를 조회합니다.
   *
   * @param regionId 지역 ID (옵셔널)
   * @returns 카테고리별 상품 개수 배열
   */
  async findCategoryCounts(regionId?: string): Promise<CategoryCountDto[]> {
    const knex = this.em.getKnex();

    const query = knex
      .select(['product_post.category', knex.raw('COUNT(*) as count')])
      .from('product_post')
      .where('product_post.is_deleted', false)
      .where('product_post.is_hidden', false)
      .groupBy('product_post.category');

    // 지역 필터링
    if (regionId && regionId.trim() !== '') {
      query.where('product_post.region_id', regionId);
    }

    const results = await query;

    return results.map(
      (row) =>
        new CategoryCountDto(
          row.category as ProductCategory,
          Number(row.count),
        ),
    );
  }
}
