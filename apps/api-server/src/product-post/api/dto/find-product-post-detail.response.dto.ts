import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ description: '지역 ID' })
  regionId: number;

  @ApiProperty({ description: '지역명', nullable: true })
  regionName: string | null;

  @ApiProperty({ description: '대학교 ID', nullable: true })
  universityId: number | null;

  @ApiProperty({ description: '대학교명', nullable: true })
  universityName: string | null;

  @ApiProperty({ description: '게시글 숨김 여부' })
  isHidden: boolean;

  constructor(
    id: number,
    title: string,
    description: string,
    price: number,
    currencyType: CurrencyType,
    category: ProductCategory,
    tradeStatus: TradeStatus,
    tradeType: TradeType,
    tradeTypeDescription: string,
    createdAt: Date,
    imageUrls: string[],
    isLiked: boolean,
    likeCount: number,
    chatRoomCount: number,
    isOwner: boolean,
    sellerId: number,
    sellerNickname: string,
    sellerProfileImageUrl: string,
    regionId: number,
    regionName: string | null,
    universityId: number | null,
    universityName: string | null,
    isHidden: boolean,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.currencyType = currencyType;
    this.category = category;
    this.tradeStatus = tradeStatus;
    this.tradeType = tradeType;
    this.tradeTypeDescription = tradeTypeDescription;
    this.createdAt = createdAt;
    this.imageUrls = imageUrls;
    this.isLiked = isLiked;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.isOwner = isOwner;
    this.sellerId = sellerId;
    this.sellerNickname = sellerNickname;
    this.sellerProfileImageUrl = sellerProfileImageUrl;
    this.regionId = regionId;
    this.regionName = regionName;
    this.universityId = universityId;
    this.universityName = universityName;
    this.isHidden = isHidden;
  }

  static from(
    productPostDetail: ProductPostDetailResultDto,
  ): FindProductPostDetailResponseDto {
    return new FindProductPostDetailResponseDto(
      productPostDetail.id,
      productPostDetail.title,
      productPostDetail.description || '',
      productPostDetail.price,
      productPostDetail.currencyType,
      productPostDetail.category,
      productPostDetail.tradeStatus,
      productPostDetail.tradeType,
      productPostDetail.tradeTypeDescription || '',
      productPostDetail.createdAt,
      productPostDetail.imageUrls,
      productPostDetail.isLiked,
      productPostDetail.likeCount,
      productPostDetail.chatRoomCount,
      productPostDetail.isOwner,
      productPostDetail.sellerId,
      productPostDetail.sellerNickname,
      productPostDetail.sellerProfileImageUrl || '',
      productPostDetail.regionId,
      productPostDetail.regionName,
      productPostDetail.universityId,
      productPostDetail.universityName,
      productPostDetail.isHidden,
    );
  }
}
