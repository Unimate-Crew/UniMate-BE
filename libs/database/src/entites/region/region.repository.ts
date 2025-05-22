import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Region } from './region.entity';

@Injectable()
export class RegionRepository extends EntityRepository<Region> {
  async findById(id: number): Promise<Region | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByName(name: string): Promise<Region | null> {
    return this.findOne({ name, isDeleted: false });
  }

  async findAllActive(): Promise<Region[]> {
    return this.find({ isDeleted: false });
  }

  async persist(region: Region): Promise<void> {
    await this.em.persist(region);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(region: Region): Promise<void> {
    await this.em.persistAndFlush(region);
  }
}
