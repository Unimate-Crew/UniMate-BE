import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { DatabaseModule } from '@app/database';
import { ApiServerService } from './api-server.service';
import { ApiServerController } from './api-server.controller';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { CityModule } from './city/city.module';
import { PostModule } from './post/post.module';
import { UniversityModule } from './university/university.module';

@Module({
  imports: [
    CommonModule,
    LoggerModule,
    UserModule,
    DatabaseModule,
    AuthModule,
    CityModule,
    PostModule,
    UniversityModule,
  ],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
