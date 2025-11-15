import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Device, User } from '@app/database';
import { DeviceService } from './service/device.service';
import { DeviceController } from './controller/device.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Device, User])],
  providers: [DeviceService],
  controllers: [DeviceController],
  exports: [DeviceService],
})
export class DeviceModule {}
