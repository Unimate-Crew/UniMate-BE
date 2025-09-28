import { ProductPostDetailWithRelations } from '@app/database/entites/product-post/dto/product-post-detail-with-relations.dto';
import {
  ProductCategory,
  TradeStatus,
  CurrencyType,
  TradeType,
} from '@app/database/common/enums';

export class ProductPostDetailResultDto {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly currencyType: CurrencyType,
    public readonly category: ProductCategory,
    public readonly tradeStatus: TradeStatus,
    public readonly tradeType: TradeType,
    public readonly tradeTypeDescription: string | null,
    public readonly createdAt: Date,
    public readonly imageUrls: string[],
    public readonly isLiked: boolean,
    public readonly likeCount: number,
    public readonly chatRoomCount: number,
    public readonly isOwner: boolean,
    public readonly sellerId: number,
    public readonly sellerNickname: string,
    public readonly sellerProfileImageUrl: string | null,
    public readonly regionId: string,
    public readonly regionName: string | null,
    public readonly universityId: number | null,
    public readonly universityName: string | null,
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
    const { productPost } = productPostDetail;
    return new ProductPostDetailResultDto(
      productPost.getId(),
      productPost.getTitle(),
      productPost.getDescription(),
      productPost.getPrice(),
      productPost.getCurrencyType(),
      productPost.getCategory(),
      productPost.getTradeStatus(),
      productPost.getTradeType(),
      productPost.getTradeTypeDescription(),
      productPost.createdAt,
      imageUrls,
      isLiked,
      likeCount,
      chatRoomCount,
      isOwner,
      productPostDetail.sellerId,
      productPostDetail.sellerNickname,
      sellerProfileImageUrl,
      productPost.getRegionId(),
      productPostDetail.regionName,
      productPost.getUniversityId(),
      productPostDetail.universityName,
    );
  }
}
