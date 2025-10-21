// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType, TradeStatus } from '@app/database/common/enums';
import { Slice } from '@app/common/utils/pagination';
import { ProductPostResultDto } from '../../application/dto/product-post.result.dto';

export class MyLikesItemDto {
  @ApiProperty({
    description: '상품 게시글 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '상품 게시글 제목',
    example: '미국 뉴욕 여행 가이드북 팝니다',
  })
  title: string;

  @ApiProperty({
    description: '상품 게시글 생성 시간',
    example: '2023-06-15T09:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '대학교 이름',
    example: '서울대학교',
    required: false,
    nullable: true,
  })
  universityName?: string | null;

  @ApiProperty({
    description: '상품 게시글 대표 사진 URL',
    example: 'https://example.com/images/product-post1.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: '가격',
    example: 15000,
  })
  price: number;

  @ApiProperty({
    description: '통화 타입',
    example: CurrencyType.KRW,
    enum: CurrencyType,
  })
  currencyType: CurrencyType;

  @ApiProperty({
    description: '좋아요 수',
    example: 24,
  })
  likeCount: number;

  @ApiProperty({
    description: '채팅방 수',
    example: 5,
  })
  chatRoomCount: number;

  @ApiProperty({
    description: '지역 ID',
    example: 1,
  })
  regionId: number;

  @ApiProperty({
    description: '거래 상태',
    example: TradeStatus.FOR_SALE,
    enum: TradeStatus,
  })
  tradeStatus: TradeStatus;

  @ApiProperty({
    description: '좋아요 여부 (내가 좋아요한 게시글인지)',
    example: true,
  })
  isLiked: boolean;

  constructor(
    id: number,
    title: string,
    createdAt: string,
    universityName: string,
    thumbnailUrl: string,
    price: number,
    currencyType: CurrencyType,
    likeCount: number,
    chatRoomCount: number,
    regionId: number,
    tradeStatus: TradeStatus,
    isLiked: boolean,
  ) {
    this.id = id;
    this.title = title;
    this.createdAt = createdAt;
    this.universityName = universityName;
    this.thumbnailUrl = thumbnailUrl;
    this.price = price;
    this.currencyType = currencyType;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.regionId = regionId;
    this.tradeStatus = tradeStatus;
    this.isLiked = isLiked;
  }
}

export class FindMyLikesResponseDto {
  @ApiProperty({
    description: '좋아요한 상품게시글 목록',
    type: [MyLikesItemDto],
  })
  contents: MyLikesItemDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  constructor(contents: MyLikesItemDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static of(
    productPostInfoSlice: Slice<ProductPostResultDto>,
  ): FindMyLikesResponseDto {
    const response = new FindMyLikesResponseDto(
      productPostInfoSlice.contents.map(
        (info) =>
          new MyLikesItemDto(
            info.productPost.getId(),
            info.productPost.getTitle(),
            info.productPost.getCreatedAt().toISOString(),
            info.universityName,
            info.thumbnailUrl,
            info.productPost.getPrice(),
            info.productPost.getCurrencyType(),
            info.likeCount,
            info.chatRoomCount,
            info.productPost.getRegionId(),
            info.productPost.getTradeStatus(),
            info.isLiked,
          ),
      ),
      productPostInfoSlice.hasNext,
    );
    return response;
  }
}
