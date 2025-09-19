import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, UserTokenInfo } from '@app/auth';
import { ConversationService } from '../application/conversation.service';
import { CreateConversationRequestDto } from './dto/create-conversation-request.dto';
import { CreateConversationResponseDto } from './dto/create-conversation-response.dto';
import { MuteConversationRequestDto } from './dto/mute-conversation-request.dto';
import { UnmuteConversationRequestDto } from './dto/unmute-conversation-request.dto';

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

  @ApiOperation({ summary: '채팅방 알림 끄기' })
  @ApiResponse({
    status: 204,
    description: '채팅방 알림 끄기 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':conversationId/mute')
  async muteConversation(
    @Param() muteConversationDto: MuteConversationRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.conversationService.muteConversation({
      userId: userTokenInfo.userId,
      conversationId: Number(muteConversationDto.conversationId),
    });
  }

  @ApiOperation({ summary: '채팅방 알림 켜기' })
  @ApiResponse({
    status: 204,
    description: '채팅방 알림 켜기 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':conversationId/unmute')
  async unmuteConversation(
    @Param() unmuteConversationDto: UnmuteConversationRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.conversationService.unmuteConversation({
      userId: userTokenInfo.userId,
      conversationId: Number(unmuteConversationDto.conversationId),
    });
  }
}
