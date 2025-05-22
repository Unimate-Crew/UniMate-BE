import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsCity } from 'libs/database/src/entites/city/us-city.entity';
import { UsState } from '@app/database/entites/region/us-state.entity';
import { UsCounty } from '@app/database/entites/region/us-county.entity';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [MikroOrmModule.forFeature([UsCity, UsState, UsCounty])],
  controllers: [CityController],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
