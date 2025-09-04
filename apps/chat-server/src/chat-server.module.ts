import { Module } from '@nestjs/common';
import { RedisModule } from '@app/redis';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';

@Module({
  imports: [RedisModule],
  controllers: [ChatServerController],
  providers: [ChatServerService],
})
export class ChatServerModule {}
