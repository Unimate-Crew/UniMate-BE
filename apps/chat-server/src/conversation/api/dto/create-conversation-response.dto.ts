import { ApiProperty } from '@nestjs/swagger';
import { CreateConversationResultDto } from '../../application/dto/create-conversation-result.dto';

export class CreateConversationResponseDto {
  @ApiProperty({
    description: '채팅방 ID',
    example: 1,
  })
  conversationId!: number;

  private constructor(id: number) {
    this.conversationId = id;
  }

  static from(
    result: CreateConversationResultDto,
  ): CreateConversationResponseDto {
    return new CreateConversationResponseDto(result.id);
  }
}
