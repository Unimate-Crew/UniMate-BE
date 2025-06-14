import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Slice } from '@app/common/utils/pagination';
import { TradeStatus, ProductCategory } from '../../common/enums';
// eslint-disable-next-line import/no-cycle
import { ProductPost } from './product-post.entity';
import { ProductPostWithRelations } from './dto/product-post-with-relations.dto';

@Injectable()
export class ProductPostRepository extends EntityRepository<ProductPost> {
  async findById(id: number): Promise<ProductPost | null> {
    return this.findOne({ id, isDeleted: false });
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
   * @param page 페이지 번호 (1부터 시작)
   * @param limit 페이지 크기
   * @param regionId 지역 ID
   * @returns Slice<ProductPostWithRelations>
   */
  async findPagedProductPosts(
    page: number,
    limit: number,
    regionId?: string,
  ): Promise<Slice<ProductPostWithRelations>> {
    const knex = this.em.getKnex();
    const offset = (page - 1) * limit;

    const query = knex
      .select([
        'product_post.*',
        'university.name as university_name',
        'product_image.image_url as thumbnail_url',
      ])
      .from('product_post')
      .leftJoin('university', 'product_post.university_id', 'university.id')
      .leftJoin('product_image', function () {
        this.on('product_post.id', '=', 'product_image.product_id')
          .andOn('product_image.is_thumbnail', '=', knex.raw('?', [true]))
          .andOn('product_image.is_deleted', '=', knex.raw('?', [false]));
      })
      .where('product_post.is_deleted', false);

    if (regionId) {
      query.where('product_post.region_id', regionId);
    }

    const results = await query
      .orderBy('product_post.created_at', 'desc')
      .limit(limit + 1)
      .offset(offset);

    const hasNext = results.length > limit;
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
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
          }),
          universityName: row.university_name,
          thumbnailUrl: row.thumbnail_url,
        }),
    );

    return Slice.of(content, hasNext);
  }
}
