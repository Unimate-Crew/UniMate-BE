// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '@app/database/common/enums';
import { ProductCategoryResultDto } from '../../application/dto/Product-category.result.dto';

export class ProductCategoryItemDto {
  @ApiProperty({
    description: '카테고리 코드',
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
  })
  category: ProductCategory;

  @ApiProperty({
    description: '해당 카테고리의 상품 게시글 개수',
    example: 15,
  })
  productPostCount: number;

  constructor(category: ProductCategory, productPostCount: number) {
    this.category = category;
    this.productPostCount = productPostCount;
  }
}

export class FindCategoriesResponseDto {
  @ApiProperty({
    description: '카테고리 목록',
    type: [ProductCategoryItemDto],
  })
  categories: ProductCategoryItemDto[];

  constructor(categories: ProductCategoryItemDto[]) {
    this.categories = categories;
  }

  static of(
    productCategoryInfos: ProductCategoryResultDto[],
  ): FindCategoriesResponseDto {
    const productCategoryItemDtos: ProductCategoryItemDto[] =
      productCategoryInfos.map(
        (category) =>
          new ProductCategoryItemDto(
            category.category,
            category.productPostCount,
          ),
      );

    return new FindCategoriesResponseDto(productCategoryItemDtos);
  }
}
