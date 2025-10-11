import { ApiProperty } from '@nestjs/swagger';
import { TradableUserResultDto } from '../../application/dto/tradable-user.result.dto';

class TradableUserResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '홍길동',
  })
  nickname: string;

  @ApiProperty({
    description: '채팅방 ID',
    example: 456,
  })
  conversationId: number;

  constructor(userId: number, nickname: string, conversationId: number) {
    this.userId = userId;
    this.nickname = nickname;
    this.conversationId = conversationId;
  }
}

export class GetTradableUsersResponseDto {
  @ApiProperty({
    description: '거래 가능한 사용자 목록',
    type: [TradableUserResponseDto],
  })
  tradableUsers: TradableUserResponseDto[];

  private constructor(tradableUsers: TradableUserResponseDto[]) {
    this.tradableUsers = tradableUsers;
  }

  static of(
    tradableUsers: TradableUserResultDto[],
  ): GetTradableUsersResponseDto {
    return new GetTradableUsersResponseDto(
      tradableUsers.map(
        (user) =>
          new TradableUserResponseDto(
            user.userId,
            user.nickname,
            user.conversationId,
          ),
      ),
    );
  }
}
