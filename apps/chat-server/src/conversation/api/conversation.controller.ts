import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversationService } from '../application/conversation.service';
import { CreateConversationRequestDto } from './dto/create-conversation-request.dto';
import { CreateConversationResponseDto } from './dto/create-conversation-response.dto';

@ApiTags('채팅방')
@Controller({ path: 'conversations' })
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({
    status: 201,
    description: '채팅방 생성 성공',
    type: CreateConversationResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '존재하지 않는 상품 게시글' })
  @Post()
  async createConversation(
    @Body() createConversationDto: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    const result = await this.conversationService.createConversation({
      userId: 20,
      productPostId: createConversationDto.productPostId,
    });

    return CreateConversationResponseDto.from(result);
  }
}
