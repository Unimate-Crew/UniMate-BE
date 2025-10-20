import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsClient {
  private readonly logger = new Logger(SqsClient.name);

  private readonly sqsClient: SQSClient;

  constructor(configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async sendMessage<T>(queueUrl: string, messageBody: T): Promise<void> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    await this.sqsClient.send(command);
  }

  /**
   * SQS에 여러 메시지를 배치로 전송합니다.
   * AWS SQS는 한 번에 최대 10개의 메시지를 전송할 수 있으므로,
   * 메시지가 10개를 초과하면 자동으로 여러 배치로 나누어 전송합니다.
   *
   * @param queueUrl SQS 큐 URL
   * @param messages 전송할 메시지 배열
   */
  async sendMessageBatch<T>(queueUrl: string, messages: T[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    // AWS SQS 배치 크기 제한: 10개
    const BATCH_SIZE = 10;
    const batches: T[][] = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      batches.push(messages.slice(i, i + BATCH_SIZE));
    }

    this.logger.log(
      `총 ${messages.length}개 메시지를 ${batches.length}개 배치로 전송합니다.`,
    );

    for (const batch of batches) {
      const entries: SendMessageBatchRequestEntry[] = batch.map(
        (message, index) => ({
          Id: `msg-${Date.now()}-${index}`,
          MessageBody: JSON.stringify(message),
        }),
      );

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      });

      try {
        const result = await this.sqsClient.send(command);

        if (result.Failed && result.Failed.length > 0) {
          this.logger.error(
            `배치 전송 중 ${result.Failed.length}개 메시지 실패`,
            result.Failed,
          );
        }

        if (result.Successful && result.Successful.length > 0) {
          this.logger.debug(
            `배치 전송 성공: ${result.Successful.length}개 메시지`,
          );
        }
      } catch (error) {
        this.logger.error(`배치 전송 실패: ${error.message}`, error.stack);
        throw error;
      }
    }
  }
}
