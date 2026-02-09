import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Terms } from '@app/database';
import { TermsController } from './api/terms.controller';
import { TermsService } from './application/terms.service';

@Module({
  imports: [MikroOrmModule.forFeature([Terms])],
  controllers: [TermsController],
  providers: [TermsService],
  exports: [TermsService],
})
export class TermsModule {}
