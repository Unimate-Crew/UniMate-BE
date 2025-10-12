import { ApiProperty } from '@nestjs/swagger';
import { TradeProgressStatus } from '@app/database/common/enums';
import { TradeProgressResultDto } from '../../application/dto/trade-progress.result.dto';

export class GetTradeProgressResponseDto {
  @ApiProperty({
    description: '구매자 ID',
    example: 123,
  })
  buyerId: number;

  @ApiProperty({
    description: '구매자 닉네임',
    example: '홍길동',
    required: false,
  })
  buyerNickname?: string;

  @ApiProperty({
    description: '채팅방 ID',
    example: 456,
  })
  conversationId: number;

  @ApiProperty({
    description: '거래 진행 상태',
    enum: TradeProgressStatus,
    example: TradeProgressStatus.RESERVED,
  })
  status: TradeProgressStatus;

  private constructor(
    buyerId: number,
    conversationId: number,
    status: TradeProgressStatus,
    buyerNickname?: string,
  ) {
    this.buyerId = buyerId;
    this.buyerNickname = buyerNickname;
    this.conversationId = conversationId;
    this.status = status;
  }

  static of(
    tradeProgress: TradeProgressResultDto,
  ): GetTradeProgressResponseDto {
    return new GetTradeProgressResponseDto(
      tradeProgress.buyerId,
      tradeProgress.conversationId,
      tradeProgress.status,
      tradeProgress.buyerNickname,
    );
  }
}
