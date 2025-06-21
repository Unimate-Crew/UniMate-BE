// eslint-disable-next-line import/no-cycle
import { ProductPost } from '../product-post.entity';

export class ProductPostWithRelations {
  readonly productPost: ProductPost;

  readonly universityName: string | null;

  readonly thumbnailImageKey: string | null;

  constructor(params: {
    productPost: ProductPost;
    universityName: string | null;
    thumbnailImageKey: string | null;
  }) {
    this.productPost = params.productPost;
    this.universityName = params.universityName;
    this.thumbnailImageKey = params.thumbnailImageKey;
  }
}
