import { ProductPost } from '@app/database/entites/product-post/product-post.entity';

export class ProductPostResultDto {
  productPost: ProductPost;

  universityName: string;

  thumbnailUrl: string;

  likeCount: number;

  chatRoomCount: number;

  isLiked: boolean;

  constructor(
    productPost: ProductPost,
    universityName: string,
    thumbnailUrl: string,
    likeCount: number,
    chatRoomCount: number,
    isLiked: boolean,
  ) {
    this.productPost = productPost;
    this.universityName = universityName;
    this.thumbnailUrl = thumbnailUrl;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.isLiked = isLiked;
  }
}
