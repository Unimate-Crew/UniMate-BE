import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatClientService } from './chat-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ChatClientService],
  exports: [ChatClientService],
})
export class ChatClientModule {}
