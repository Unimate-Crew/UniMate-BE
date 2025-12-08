import { Module } from '@nestjs/common';
import { S3Module } from '@app/common/s3/s3.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  User,
  InterestRegion,
  University,
  Review,
  ProductPost,
  ProductImage,
  ConversationParticipant,
  Notification,
  Like,
  Report,
  UserBlock,
  Device,
} from '@app/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SnsModule } from '../sns/sns.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SnsModule,
    AuthModule,
    S3Module,
    MikroOrmModule.forFeature([
      User,
      InterestRegion,
      University,
      Review,
      ProductPost,
      ProductImage,
      ConversationParticipant,
      Notification,
      Like,
      Report,
      UserBlock,
      Device,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
