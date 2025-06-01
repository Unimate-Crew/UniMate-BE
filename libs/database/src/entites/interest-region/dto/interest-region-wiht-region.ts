// eslint-disable-next-line import/no-cycle
import { InterestRegion } from '../interest-region.entity';
import { Region } from '../../region/region.entity';

export class InterestRegionWithRegion {
  constructor(
    private interestRegion: InterestRegion,
    private region: Region,
  ) {}

  getInterestRegion(): InterestRegion {
    return this.interestRegion;
  }

  getRegion(): Region {
    return this.region;
  }
}

