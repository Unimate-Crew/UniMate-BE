import { Module } from '@nestjs/common';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import { InterestRegion, Review, User } from '@app/database';
import { S3Module } from '@app/common/s3/s3.module';
import { Like } from '@app/database/entites/like/like.entity';
import { UserBlock } from '@app/database/entites/user-block/user-block.entity';
import { TradeProgress } from '@app/database/entites/trade-progress/trade-progress.entity';
import { ProductPostController } from './api/product-post.controller';
import { ProductPostService } from './application/product-post.service';
import { NotificationModule } from '../notification/notification.module';
import { ChatClientModule } from '../chat-client/chat-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductPost,
      ProductImage,
      User,
      Like,
      UserBlock,
      InterestRegion,
      TradeProgress,
      Review,
    ]),
    S3Module,
    NotificationModule,
    ChatClientModule,
  ],
  controllers: [ProductPostController],
  providers: [ProductPostService],
  exports: [ProductPostService],
})
export class ProductPostModule {}
