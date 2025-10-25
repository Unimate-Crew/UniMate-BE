import { ProductPost } from '@app/database/entites/product-post/product-post.entity';

export class PurchaseHistoryResultDto {
  productPost: ProductPost;

  universityName: string;

  thumbnailUrl: string;

  likeCount: number;

  chatRoomCount: number;

  isLiked: boolean;

  hasReview: boolean;

  purchasedAt: Date;

  constructor(
    productPost: ProductPost,
    universityName: string,
    thumbnailUrl: string,
    likeCount: number,
    chatRoomCount: number,
    isLiked: boolean,
    hasReview: boolean,
    purchasedAt: Date,
  ) {
    this.productPost = productPost;
    this.universityName = universityName;
    this.thumbnailUrl = thumbnailUrl;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.isLiked = isLiked;
    this.hasReview = hasReview;
    this.purchasedAt = purchasedAt;
  }
}