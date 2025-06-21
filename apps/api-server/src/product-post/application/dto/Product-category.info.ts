import { ProductCategory } from '@app/database/common/enums';
import { CategoryCountDto } from '@app/database/entites/product-post/dto/category-count.dto';

export class ProductCategoryInfo {
  constructor(
    public readonly category: ProductCategory,
    public readonly productPostCount: number,
  ) {}

  static of(categoryCounts: CategoryCountDto[]): ProductCategoryInfo[] {
    // 실제 데이터가 있는 카테고리들을 Map으로 변환
    const categoryMap = new Map(
      categoryCounts.map((item) => [item.category, item.count]),
    );

    // 모든 카테고리에 대해 ProductCategoryInfo 생성 (없는 카테고리는 0으로 설정)
    return Object.values(ProductCategory).map(
      (category) =>
        new ProductCategoryInfo(category, categoryMap.get(category) ?? 0),
    );
  }
}
