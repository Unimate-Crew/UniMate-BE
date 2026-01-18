import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SendSystemMessageRequestDto {
  @ApiProperty({ description: '채팅방 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;

  @ApiProperty({
    description: '시스템 메시지 내용',
    example: '거래 상태가 [예약중]으로 변경되었어요',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
