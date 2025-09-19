import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class MuteConversationRequestDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumberString()
  conversationId: string;
}
