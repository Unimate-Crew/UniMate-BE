import { ProductCategory } from '../../../common/enums';

export class CategoryCountDto {
  constructor(
    public readonly category: ProductCategory,
    public readonly count: number,
  ) {}
}
