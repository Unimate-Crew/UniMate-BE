import { ProductPostDetailWithRelations } from '@app/database/entites/product-post/dto/product-post-detail-with-relations.dto';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';

export class ProductPostDetailResultDto {
  constructor(
    public readonly productPost: ProductPost,
    public readonly imageUrls: string[],
    public readonly isLiked: boolean,
    public readonly likeCount: number,
    public readonly chatRoomCount: number,
    public readonly isOwner: boolean,
    public readonly sellerId: number,
    public readonly sellerNickname: string,
    public readonly sellerProfileImageUrl: string | null,
  ) {}

  static of(
    productPostDetail: ProductPostDetailWithRelations,
    imageUrls: string[],
    isLiked: boolean,
    likeCount: number,
    chatRoomCount: number,
    isOwner: boolean,
    sellerProfileImageUrl: string | null,
  ): ProductPostDetailResultDto {
    return new ProductPostDetailResultDto(
      productPostDetail.productPost,
      imageUrls,
      isLiked,
      likeCount,
      chatRoomCount,
      isOwner,
      productPostDetail.sellerId,
      productPostDetail.sellerNickname,
      sellerProfileImageUrl,
    );
  }
}
