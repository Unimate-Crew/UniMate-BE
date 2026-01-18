import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Conversation,
  ConversationParticipant,
  ConversationMessage,
  User,
  Device,
} from '@app/database';
import { RedisModule } from '@app/redis';
import { SqsModule } from '@app/common';
import { ChatGateway } from './api/chat.gateway';
import { InternalChatController } from './api/internal-chat.controller';
import { ChatService } from './application/chat.service';
import { WebSocketAuthMiddleware } from '../common/middleware/websocket-auth.middleware';
import { InternalApiGuard } from '../common/guards/internal-api.guard';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      ConversationMessage,
      User,
      Device,
    ]),
    RedisModule,
    SqsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [InternalChatController],
  providers: [
    ChatGateway,
    ChatService,
    WebSocketAuthMiddleware,
    InternalApiGuard,
  ],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
