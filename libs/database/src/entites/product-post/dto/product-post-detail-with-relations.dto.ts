import { ProductPost } from '../product-post.entity';

export class ProductPostDetailWithRelations {
  constructor(
    public readonly productPost: ProductPost,
    public readonly sellerId: number,
    public readonly sellerNickname: string,
    public readonly sellerProfileImageKey: string | null,
    public readonly imageKeys: string[],
  ) {}

  static of(data: {
    productPost: ProductPost;
    sellerId: number;
    sellerNickname: string;
    sellerProfileImageKey: string | null;
    imageKeys: string[];
  }): ProductPostDetailWithRelations {
    return new ProductPostDetailWithRelations(
      data.productPost,
      data.sellerId,
      data.sellerNickname,
      data.sellerProfileImageKey,
      data.imageKeys,
    );
  }
}
