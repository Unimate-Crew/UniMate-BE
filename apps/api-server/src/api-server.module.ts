import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { DatabaseModule } from '@app/database';
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

@Module({
  imports: [
    CommonModule,
    LoggerModule,
    UserModule,
    DatabaseModule,
    AuthModule,
    RegionModule,
    ProductPostModule,
    UniversityModule,
    NotificationModule,
    ReviewModule,
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
