import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UpdatePopup } from '@app/database/entites/update-popup/update-popup.entity';
import { UpdatePopupController } from './api/update-popup.controller';
import { UpdatePopupService } from './application/update-popup.service';

@Module({
  imports: [MikroOrmModule.forFeature([UpdatePopup])],
  controllers: [UpdatePopupController],
  providers: [UpdatePopupService],
  exports: [UpdatePopupService],
})
export class UpdatePopupModule {}
