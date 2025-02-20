import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger/logger.module';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';

@Module({
  imports: [LoggerModule],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
