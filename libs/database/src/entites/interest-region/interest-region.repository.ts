import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { InterestRegion } from './interest-region.entity';

@Injectable()
export class InterestRegionRepository extends EntityRepository<InterestRegion> {
  async findById(id: number): Promise<InterestRegion | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<InterestRegion[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findPrimaryByUserId(userId: number): Promise<InterestRegion | null> {
    return this.findOne({ userId, isPrimary: true, isDeleted: false });
  }

  async findByRegionId(regionId: number): Promise<InterestRegion[]> {
    return this.find({ regionId, isDeleted: false });
  }

  async findByUserIdAndRegionId(
    userId: number,
    regionId: number,
  ): Promise<InterestRegion | null> {
    return this.findOne({ userId, regionId, isDeleted: false });
  }

  async persist(interestRegion: InterestRegion): Promise<void> {
    await this.em.persist(interestRegion);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(interestRegion: InterestRegion): Promise<void> {
    await this.em.persistAndFlush(interestRegion);
  }
}
