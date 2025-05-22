import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Region } from './region.entity';
import { PagedResult } from '@app/common';

@Injectable()
export class RegionRepository extends EntityRepository<Region> {
  async findById(id: string): Promise<Region | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByName(name: string): Promise<Region | null> {
    return this.findOne({ name, isDeleted: false });
  }

  async findByNameLike(
    name: string,
    page: number,
    limit: number,
  ): Promise<PagedResult<Region>> {
    const [entities, totalCount] = await this.findAndCount(
      {
        name: { $like: `%${name}%` } as any,
        isDeleted: false,
      },
      {
        limit,
        offset: (page - 1) * limit,
      },
    );

    return {
      content: entities,
      page,
      limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
    };
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
