import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Conversation,
  ConversationParticipant,
  ProductPost,
  User,
} from '@app/database';
import { ChatModule } from '../chat/chat.module';
import { ConversationController } from './api/conversation.controller';
import { ConversationService } from './application/conversation.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      ProductPost,
      User,
    ]),
    ChatModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
