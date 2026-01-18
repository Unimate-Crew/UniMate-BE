import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ChatClientService {
  private readonly logger = new Logger(ChatClientService.name);

  private readonly chatServerUrl: string;

  private readonly internalApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.chatServerUrl = this.configService.get<string>(
      'CHAT_SERVER_URL',
      'http://localhost:3001',
    );
    this.internalApiKey = this.configService.get<string>(
      'CHAT_SERVER_INTERNAL_API_KEY',
      '',
    );
  }

  /**
   * 채팅방에 시스템 메시지를 전송합니다.
   * 실패해도 예외를 던지지 않고 로깅만 합니다.
   *
   * @param params.conversationId 채팅방 ID
   * @param params.content 시스템 메시지 내용
   */
  async sendSystemMessage(params: {
    conversationId: number;
    content: string;
  }): Promise<void> {
    if (!this.internalApiKey) {
      this.logger.warn(
        'CHAT_SERVER_INTERNAL_API_KEY가 설정되지 않아 시스템 메시지를 전송하지 않습니다.',
      );
      return;
    }

    try {
      await this.httpService.axiosRef.post(
        `${this.chatServerUrl}/internal/chat/system-messages`,
        {
          conversationId: params.conversationId,
          content: params.content,
        },
        {
          headers: {
            'X-Internal-Api-Key': this.internalApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5초 타임아웃
        },
      );

      this.logger.log(
        `시스템 메시지 전송 성공 (conversationId: ${params.conversationId})`,
      );
    } catch (error) {
      this.logger.error(
        `시스템 메시지 전송 실패 (conversationId: ${params.conversationId}): ${error.message}`,
        error.stack,
      );
      // 실패해도 예외를 던지지 않음 - 거래 상태 변경은 성공 처리
    }
  }
}
