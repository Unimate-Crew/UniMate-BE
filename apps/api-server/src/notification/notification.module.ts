import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Notification } from '@app/database';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Notification])],
  providers: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
