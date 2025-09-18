import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserBlock } from '@app/database/entites/user-block/user-block.entity';
import { User } from '@app/database/entites/user/user.entity';
import { UserBlockController } from './api/user-block.controller';
import { UserBlockService } from './application/user-block.service';

@Module({
  imports: [MikroOrmModule.forFeature([UserBlock, User])],
  controllers: [UserBlockController],
  providers: [UserBlockService],
  exports: [UserBlockService],
})
export class UserBlockModule {}
