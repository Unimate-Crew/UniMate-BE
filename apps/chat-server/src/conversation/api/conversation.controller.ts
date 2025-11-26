import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
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
import { MuteConversationRequestDto } from './dto/mute-conversation-request.dto';
import { UnmuteConversationRequestDto } from './dto/unmute-conversation-request.dto';
import { LeaveConversationRequestDto } from './dto/leave-conversation-request.dto';
import { GetMessagesRequestDto } from './dto/get-messages-request.dto';
import { GetMessagesResponseDto } from './dto/get-messages-response.dto';
import { CheckSendPermissionResponseDto } from './dto/check-send-permission-response.dto';

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

  @ApiOperation({
    summary: '채팅방 메시지 리스트 조회',
    description:
      '특정 채팅방의 메시지 목록을 커서 기반 페이지네이션으로 조회합니다. 읽음 상태 정보가 포함됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '메시지 리스트 조회 성공',
    type: GetMessagesResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증 토큰이 유효하지 않음' })
  @ApiResponse({ status: 403, description: '권한 없음 (채팅방 참여자가 아님)' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query() getMessagesDto: GetMessagesRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetMessagesResponseDto> {
    const result = await this.conversationService.getMessages({
      userId: userTokenInfo.userId,
      conversationId,
      size: getMessagesDto.getPageSize(),
      lastMessageNumber: getMessagesDto.getLastMessageNumber(),
    });

    return GetMessagesResponseDto.from(result);
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

  @ApiOperation({ summary: '채팅방 나가기' })
  @ApiResponse({
    status: 204,
    description: '채팅방 나가기 성공',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':conversationId/leave')
  async leaveConversation(
    @Param() leaveConversationDto: LeaveConversationRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.conversationService.leaveConversation({
      userId: userTokenInfo.userId,
      conversationId: Number(leaveConversationDto.conversationId),
    });
  }

  @ApiOperation({
    summary: '채팅 발송 가능 여부 조회',
    description:
      '채팅방에서 현재 사용자가 메시지를 발송할 수 있는지 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: CheckSendPermissionResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 토큰이 유효하지 않음' })
  @ApiResponse({ status: 403, description: '권한 없음 (채팅방 참여자가 아님)' })
  @ApiResponse({ status: 404, description: '채팅방을 찾을 수 없음' })
  @Get(':conversationId/send-permission')
  async checkSendPermission(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<CheckSendPermissionResponseDto> {
    const result = await this.conversationService.checkSendMessagePermission({
      conversationId,
      userId: userTokenInfo.userId,
    });

    return CheckSendPermissionResponseDto.from(result);
  }
}
