import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { ApiServerService } from './api-server.service';
import { ApiServerController } from './api-server.controller';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RegionModule } from './region/region.module';
import { ProductPostModule } from './product-post/product-post.module';
import { UniversityModule } from './university/university.module';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { UserBlockModule } from './user-block/user-block.module';
import { UpdatePopupModule } from './update-popup/update-popup.module';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [
    CommonModule,
    LoggerModule,
    UserModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    RegionModule,
    ProductPostModule,
    UniversityModule,
    NotificationModule,
    ReviewModule,
    UserBlockModule,
    UpdatePopupModule,
    DeviceModule,
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
