import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class PushService {
  private readonly sqsClient: SQSClient;

  private readonly queueUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    this.queueUrl = this.configService.get<string>(
      'PUSH_NOTIFICATION_QUEUE_URL',
    );
  }

  async sendPushNotification(params: {
    userId: number;
    content: any;
  }): Promise<void> {
    const { userId, content } = params;

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(content),
      MessageAttributes: {
        userId: {
          StringValue: userId.toString(),
          DataType: 'String',
        },
      },
    });

    await this.sqsClient.send(command);
  }
}
