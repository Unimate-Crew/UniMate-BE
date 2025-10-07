import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { University } from '@app/database';
import { RedisModule } from '@app/redis';
import { SqsModule } from '@app/common';
import { UniversityService } from './application/university.service';
import { UniversityController } from './api/university.controller';

@Module({
  imports: [MikroOrmModule.forFeature([University]), RedisModule, SqsModule],
  providers: [UniversityService],
  controllers: [UniversityController],
  exports: [UniversityService],
})
export class UniversityModule {}
