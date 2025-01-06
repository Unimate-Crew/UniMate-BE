import { Controller, Get } from '@nestjs/common';
import { ChatServerService } from './chat-server.service';

@Controller()
export class ChatServerController {
  constructor(private readonly chatServerService: ChatServerService) {}

  @Get()
  getHello(): string {
    return this.chatServerService.getHello();
  }
}
