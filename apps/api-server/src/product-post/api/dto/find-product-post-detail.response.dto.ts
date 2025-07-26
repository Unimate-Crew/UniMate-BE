import { ApiProperty } from '@nestjs/swagger';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import {
  ProductCategory,
  TradeStatus,
  CurrencyType,
  TradeType,
} from '@app/database/common/enums';
import { ProductPostDetailResultDto } from '../../application/dto/product-post-detail.result.dto';

export class FindProductPostDetailResponseDto {
  @ApiProperty({ description: '상품 게시글 ID' })
  id: number;

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '상세 설명' })
  description: string;

  @ApiProperty({ description: '가격' })
  price: number;

  @ApiProperty({ description: '통화 타입', enum: CurrencyType })
  currencyType: CurrencyType;

  @ApiProperty({ description: '상품 카테고리', enum: ProductCategory })
  category: ProductCategory;

  @ApiProperty({ description: '거래 상태', enum: TradeStatus })
  tradeStatus: TradeStatus;

  @ApiProperty({ description: '거래 방식', enum: TradeType })
  tradeType: TradeType;

  @ApiProperty({ description: '거래 방식 상세 설명' })
  tradeTypeDescription: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '이미지 URL 목록' })
  imageUrls: string[];

  @ApiProperty({ description: '좋아요 여부 (내가 좋아요한 게시글인지)' })
  isLiked: boolean;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '채팅방 수' })
  chatRoomCount: number;

  @ApiProperty({ description: '상품 게시글 주인 여부' })
  isOwner: boolean;

  @ApiProperty({ description: '판매자 ID' })
  sellerId: number;

  @ApiProperty({ description: '판매자 닉네임' })
  sellerNickname: string;

  @ApiProperty({ description: '판매자 프로필 사진 URL' })
  sellerProfileImageUrl: string;

  constructor(
    productPost: ProductPost,
    imageUrls: string[],
    isLiked: boolean,
    likeCount: number,
    chatRoomCount: number,
    isOwner: boolean,
    sellerId: number,
    sellerNickname: string,
    sellerProfileImageUrl: string,
  ) {
    this.id = productPost.getId();
    this.title = productPost.getTitle();
    this.description = productPost.getDescription() || '';
    this.price = productPost.getPrice();
    this.currencyType = productPost.getCurrencyType();
    this.category = productPost.getCategory();
    this.tradeStatus = productPost.getTradeStatus();
    this.tradeType = productPost.getTradeType();
    this.tradeTypeDescription = productPost.getTradeTypeDescription() || '';
    this.createdAt = productPost.createdAt;
    this.imageUrls = imageUrls;
    this.isLiked = isLiked;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.isOwner = isOwner;
    this.sellerId = sellerId;
    this.sellerNickname = sellerNickname;
    this.sellerProfileImageUrl = sellerProfileImageUrl;
  }

  static from(
    productPostDetail: ProductPostDetailResultDto,
  ): FindProductPostDetailResponseDto {
    return new FindProductPostDetailResponseDto(
      productPostDetail.productPost,
      productPostDetail.imageUrls,
      productPostDetail.isLiked,
      productPostDetail.likeCount,
      productPostDetail.chatRoomCount,
      productPostDetail.isOwner,
      productPostDetail.sellerId,
      productPostDetail.sellerNickname,
      productPostDetail.sellerProfileImageUrl,
    );
  }
}
