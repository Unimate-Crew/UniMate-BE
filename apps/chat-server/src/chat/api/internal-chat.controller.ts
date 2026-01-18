import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ChatService } from '../application/chat.service';
import { ChatGateway } from './chat.gateway';
import { SendSystemMessageRequestDto } from './dto/send-system-message.request.dto';
import { InternalApiGuard } from '../../common/guards/internal-api.guard';
import { MessageEmissionResultDto } from '../application/dto/websocket-emission.result.dto';

@ApiTags('Internal Chat API')
@Controller('internal/chat')
@UseGuards(InternalApiGuard)
export class InternalChatController {
  private readonly logger = new Logger(InternalChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('system-messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '시스템 메시지 전송',
    description: '채팅방에 시스템 메시지를 전송합니다. (내부 API)',
  })
  @ApiHeader({
    name: 'x-internal-api-key',
    description: '내부 API 키',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '시스템 메시지 전송 성공',
    schema: {
      properties: {
        messageId: { type: 'number', example: 123 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (잘못된 API 키)',
  })
  @ApiResponse({
    status: 404,
    description: '채팅방을 찾을 수 없음',
  })
  async sendSystemMessage(
    @Body() dto: SendSystemMessageRequestDto,
  ): Promise<{ messageId: number }> {
    this.logger.log(
      `Sending system message to conversation ${dto.conversationId}: ${dto.content}`,
    );

    const result: MessageEmissionResultDto =
      await this.chatService.sendSystemMessage({
        conversationId: dto.conversationId,
        content: dto.content,
      });

    // WebSocket을 통해 참여자들에게 브로드캐스트
    result.emissions.forEach((emission) => {
      this.chatGateway.server
        .to(`user_${emission.userId}`)
        .emit(emission.event, emission.data);
    });

    this.logger.log(
      `System message sent successfully: messageId=${result.message.id}`,
    );

    return { messageId: result.message.id };
  }
}
