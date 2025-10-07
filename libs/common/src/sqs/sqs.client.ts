import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SqsClient {
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
}
