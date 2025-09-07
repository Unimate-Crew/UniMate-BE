import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Conversation,
  ConversationParticipant,
  ConversationMessage,
} from '@app/database';
import { RedisModule } from '@app/redis';
import { ChatGateway } from './api/chat.gateway';
import { ChatService } from './application/chat.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      ConversationMessage,
    ]),
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
