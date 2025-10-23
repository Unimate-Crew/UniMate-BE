import { Module } from '@nestjs/common';
import { Report, User } from '@app/database';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReportController } from './api/report.controller';
import { ReportService } from './application/report.service';
import { UserBlockModule } from '../user-block/user-block.module';

@Module({
  imports: [MikroOrmModule.forFeature([Report, User]), UserBlockModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
