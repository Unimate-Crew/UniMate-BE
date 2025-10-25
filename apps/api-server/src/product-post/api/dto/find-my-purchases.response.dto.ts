// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CurrencyType, TradeStatus } from '@app/database/common/enums';
import { Slice } from '@app/common/utils/pagination';
import { PurchaseHistoryResultDto } from '../../application/dto/purchase-history.result.dto';

export class MyPurchaseItemDto {
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
    description: '상품 게시글 대표 사진 URL',
    example: 'https://example.com/images/product-post1.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: '거래 상태',
    example: TradeStatus.COMPLETED,
    enum: TradeStatus,
  })
  tradeStatus: TradeStatus;

  @ApiProperty({
    description: '대학교 이름',
    example: '서울대학교',
    required: false,
    nullable: true,
  })
  universityName?: string | null;

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
    description: '좋아요 여부 (내가 좋아요한 게시글인지)',
    example: false,
  })
  isLiked: boolean;

  @ApiProperty({
    description: '거래후기 유무 (내가 작성한 거래후기가 있는지)',
    example: true,
  })
  hasReview: boolean;

  @ApiProperty({
    description: '구매 완료 시간',
    example: '2023-06-15T09:30:00.000Z',
  })
  purchasedAt: string;

  constructor(
    id: number,
    title: string,
    thumbnailUrl: string,
    tradeStatus: TradeStatus,
    universityName: string,
    price: number,
    currencyType: CurrencyType,
    likeCount: number,
    chatRoomCount: number,
    isLiked: boolean,
    hasReview: boolean,
    purchasedAt: string,
  ) {
    this.id = id;
    this.title = title;
    this.thumbnailUrl = thumbnailUrl;
    this.tradeStatus = tradeStatus;
    this.universityName = universityName;
    this.price = price;
    this.currencyType = currencyType;
    this.likeCount = likeCount;
    this.chatRoomCount = chatRoomCount;
    this.isLiked = isLiked;
    this.hasReview = hasReview;
    this.purchasedAt = purchasedAt;
  }
}

export class FindMyPurchasesResponseDto {
  @ApiProperty({
    description: '구매내역 목록',
    type: [MyPurchaseItemDto],
  })
  contents: MyPurchaseItemDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  constructor(contents: MyPurchaseItemDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static of(
    purchaseHistorySlice: Slice<PurchaseHistoryResultDto>,
  ): FindMyPurchasesResponseDto {
    return new FindMyPurchasesResponseDto(
      purchaseHistorySlice.contents.map(
        (purchaseHistory) =>
          new MyPurchaseItemDto(
            purchaseHistory.productPost.getId(),
            purchaseHistory.productPost.getTitle(),
            purchaseHistory.thumbnailUrl,
            purchaseHistory.productPost.getTradeStatus(),
            purchaseHistory.universityName,
            purchaseHistory.productPost.getPrice(),
            purchaseHistory.productPost.getCurrencyType(),
            purchaseHistory.likeCount,
            purchaseHistory.chatRoomCount,
            purchaseHistory.isLiked,
            purchaseHistory.hasReview,
            purchaseHistory.purchasedAt.toISOString(),
          ),
      ),
      purchaseHistorySlice.hasNext,
    );
  }
}
