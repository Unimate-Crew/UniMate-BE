import { Module } from '@nestjs/common';
import { UniversityService } from './application/university.service';
import { UniversityController } from './api/university.controller';

@Module({
  providers: [UniversityService],
  controllers: [UniversityController],
  exports: [UniversityService],
})
export class UniversityModule {}
