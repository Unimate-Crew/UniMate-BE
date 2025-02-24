import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger/logger.module';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule, LoggerModule],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
