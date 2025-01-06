import { Module } from '@nestjs/common';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';

@Module({
  imports: [],
  controllers: [ChatServerController],
  providers: [ChatServerService],
})
export class ChatServerModule {}
