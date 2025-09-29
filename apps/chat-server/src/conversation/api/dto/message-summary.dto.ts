import { ApiProperty } from '@nestjs/swagger';
import { ConversationMessageType } from '@app/database';
import { MessageDto } from '../../application/dto/message.dto';

export class MessageSummaryDto {
  @ApiProperty({
    description: '메시지 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '발송자 ID',
    example: 123,
  })
  senderId: number;

  @ApiProperty({
    description: '메시지 내용',
    example: '안녕하세요!',
  })
  content?: string;

  @ApiProperty({
    description: '메시지 번호',
    example: 1,
  })
  messageNumber: number;

  @ApiProperty({
    description: '메시지 타입',
    enum: ConversationMessageType,
    example: ConversationMessageType.TEXT,
  })
  type: ConversationMessageType;

  @ApiProperty({
    description: '메시지 생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  public static from(message: MessageDto): MessageSummaryDto {
    const dto = new MessageSummaryDto();
    dto.id = message.id;
    dto.senderId = message.senderId;
    dto.content = message.content;
    dto.messageNumber = message.messageNumber;
    dto.type = message.type;
    dto.createdAt = message.createdAt;
    return dto;
  }
}
