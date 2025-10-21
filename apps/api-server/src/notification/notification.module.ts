import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Notification,
  User,
  Like,
  ConversationParticipant,
  ProductPost,
  Device,
} from '@app/database';
import { SqsModule } from '@app/common/sqs/sqs.module';
import { NotificationService } from './service/notification.service';
import { NotificationController } from './controller/notification.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Notification,
      User,
      Like,
      ConversationParticipant,
      ProductPost,
      Device,
    ]),
    SqsModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
