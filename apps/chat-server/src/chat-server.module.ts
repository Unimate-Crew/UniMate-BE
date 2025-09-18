import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { DatabaseModule } from '@app/database';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    DatabaseModule,
    ConversationModule,
  ],
  controllers: [ChatServerController],
  providers: [ChatServerService],
})
export class ChatServerModule {}
