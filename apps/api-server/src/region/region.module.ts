import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Region } from '@app/database/entites/region/region.entity';
import { UsState } from '@app/database/entites/region/us-state.entity';
import { UsCounty } from '@app/database/entites/region/us-county.entity';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  imports: [MikroOrmModule.forFeature([Region, UsState, UsCounty])],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
