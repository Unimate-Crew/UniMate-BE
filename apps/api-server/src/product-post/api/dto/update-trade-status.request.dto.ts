import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { TradeStatus } from '@app/database/common/enums';

export class UpdateTradeStatusRequestDto {
  @ApiProperty({
    description: '변경할 거래 상태',
    enum: TradeStatus,
    example: TradeStatus.RESERVED,
  })
  @IsEnum(TradeStatus)
  tradeStatus: TradeStatus;

  @ApiProperty({
    description:
      '구매자 ID (RESERVED, COMPLETED 시 필수) 단, 예약중 → 판매완료의 경우 불필요',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  buyerId?: number;

  @ApiProperty({
    description: '채팅방 ID (buyerId와 함께 제공되어야 함)',
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  conversationId?: number;
}
