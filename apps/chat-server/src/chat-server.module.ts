import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { DatabaseModule } from '@app/database';
import { JwtAccessStrategy } from '@app/auth';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';
import { ConversationModule } from './conversation/conversation.module';
import { ChatModule } from './chat/chat.module';
import { WebSocketRedisAdapterConfig } from './common/config/websocket-redis-adapter.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    ConversationModule,
    ChatModule,
  ],
  controllers: [ChatServerController],
  providers: [
    ChatServerService,
    WebSocketRedisAdapterConfig,
    JwtAccessStrategy,
  ],
})
export class ChatServerModule {}
