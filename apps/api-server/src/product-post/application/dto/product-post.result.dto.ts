import { ProductPost } from '@app/database/entites/product-post/product-post.entity';

export class ProductPostResultDto {
  productPost: ProductPost;

  universityName: string;

  thumbnailUrl: string;

  likeCount: number;

  chatRoomCount: number;

  constructor(
    productPost: ProductPost,
    universityName: string,
    thumbnailUrl: string,
    likeCount: number,
    chatRoomCount: number,
  ) {
    this.productPost = productPost;
    this.universityName = universityName;
    this.thumbnailUrl = thumbnailUrl;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
  }
}
