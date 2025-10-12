import { TradeProgressStatus } from '@app/database/common/enums';

export class TradeProgressResultDto {
  buyerId: number;

  buyerNickname?: string;

  conversationId: number;

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
    buyerId: number,
    conversationId: number,
    status: TradeProgressStatus,
    buyerNickname?: string,
  ): TradeProgressResultDto {
    return new TradeProgressResultDto(
      buyerId,
      conversationId,
      status,
      buyerNickname,
    );
  }
}