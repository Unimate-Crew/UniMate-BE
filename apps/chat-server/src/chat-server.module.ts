import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/redis';
import { ChatServerController } from './chat-server.controller';
import { ChatServerService } from './chat-server.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
  ],
  controllers: [ChatServerController],
  providers: [ChatServerService],
})
export class ChatServerModule {}
