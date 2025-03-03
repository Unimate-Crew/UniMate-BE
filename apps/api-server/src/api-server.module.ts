import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger/logger.module';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [CommonModule, LoggerModule, UserModule, DatabaseModule],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
