import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from '@app/redis';
import { DatabaseModule } from '@app/database';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';
import { ConversationModule } from './conversation/conversation.module';
import { ChatModule } from './chat/chat.module';
import { WebSocketRedisAdapterConfig } from './common/config/websocket-redis-adapter.config';
import { WebSocketExceptionFilter } from './common/websocket-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    DatabaseModule,
    ConversationModule,
    ChatModule,
  ],
  controllers: [ChatServerController],
  providers: [
    ChatServerService,
    WebSocketRedisAdapterConfig,
    {
      provide: APP_FILTER,
      useClass: WebSocketExceptionFilter,
    },
  ],
})
export class ChatServerModule {}
