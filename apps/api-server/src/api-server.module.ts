import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger/logger.module';
import { DatabaseModule } from '@app/database';
import { ApiServerController } from './api-server.controller';
import { ApiServerService } from './api-server.service';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CommonModule, LoggerModule, UserModule, DatabaseModule, AuthModule],
  controllers: [ApiServerController],
  providers: [ApiServerService],
})
export class ApiServerModule {}
