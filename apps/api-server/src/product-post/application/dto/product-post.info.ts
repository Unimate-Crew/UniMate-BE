import { ProductPost } from '@app/database/entites/product-post/product-post.entity';

export class ProductPostInfo {
  productPost: ProductPost;

  thumbnailUrl: string;

  likeCount: number;

  chatRoomCount: number;

  constructor(params: {
    productPost: ProductPost;
    thumbnailUrl: string;
    likeCount: number;
    chatRoomCount: number;
  }) {
    this.productPost = params.productPost;
    this.thumbnailUrl = params.thumbnailUrl;
    this.likeCount = params.likeCount;
    this.chatRoomCount = params.chatRoomCount;
  }
}
