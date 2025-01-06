import { Module } from '@nestjs/common';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';

@Module({
  imports: [],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
