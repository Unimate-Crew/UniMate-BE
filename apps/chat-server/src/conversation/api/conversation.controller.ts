import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, UserTokenInfo } from '@app/auth';
import { PageRequest } from '@app/common';
import { ConversationService } from '../application/conversation.service';
import { CreateConversationRequestDto } from './dto/create-conversation-request.dto';
import { CreateConversationResponseDto } from './dto/create-conversation-response.dto';
import { GetConversationsRequestDto } from './dto/get-conversations-request.dto';
import { GetConversationsResponseDto } from './dto/get-conversations-response.dto';

@ApiTags('채팅방')
@ApiBearerAuth('accessToken')
@Controller({ path: 'conversations' })
@UseGuards(JwtAuthGuard)
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
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<CreateConversationResponseDto> {
    const result = await this.conversationService.createConversation({
      userId: userTokenInfo.userId,
      productPostId: createConversationDto.productPostId,
    });

    return CreateConversationResponseDto.from(result);
  }

  @ApiOperation({
    summary: '채팅방 리스트 조회',
    description:
      '사용자가 참여한 채팅방 목록을 페이지네이션으로 조회합니다. productPostId가 제공되면 해당 상품의 채팅방만 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '채팅방 리스트 조회 성공',
    type: GetConversationsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
  })
  @ApiResponse({ status: 401, description: '인증 토큰이 유효하지 않음' })
  @Get()
  async getConversations(
    @Query() getConversationsDto: GetConversationsRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetConversationsResponseDto> {
    const result = await this.conversationService.getConversations({
      userId: userTokenInfo.userId,
      pageRequest: PageRequest.of(
        getConversationsDto.getPageNumber(),
        getConversationsDto.getPageSize(),
      ),
      productPostId: getConversationsDto.productPostId,
    });

    return GetConversationsResponseDto.from(result);
  }
}
