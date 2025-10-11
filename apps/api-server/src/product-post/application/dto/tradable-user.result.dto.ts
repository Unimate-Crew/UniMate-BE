export class TradableUserResultDto {
  userId: number;

  nickname: string;

  conversationId: number;

  private constructor(
    userId: number,
    nickname: string,
    conversationId: number,
  ) {
    this.userId = userId;
    this.nickname = nickname;
    this.conversationId = conversationId;
  }

  static of(
    userId: number,
    nickname: string,
    conversationId: number,
  ): TradableUserResultDto {
    return new TradableUserResultDto(userId, nickname, conversationId);
  }
}
