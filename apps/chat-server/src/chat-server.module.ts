import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { RedisModule } from '@app/redis';
import { DatabaseModule } from '@app/database';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';
import { ChatGateway } from './chat/api/chat.gateway';
import { ChatService } from './chat/application/chat.service';
import { WebSocketRedisAdapterService } from './websocket/websocket-redis-adapter.service';
import { WebSocketExceptionFilter } from './common/websocket-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
  ],
  controllers: [ChatServerController],
  providers: [
    ChatServerService,
    ChatGateway,
    ChatService,
    WebSocketRedisAdapterService,
    {
      provide: APP_FILTER,
      useClass: WebSocketExceptionFilter,
    },
  ],
})
export class ChatServerModule {}
