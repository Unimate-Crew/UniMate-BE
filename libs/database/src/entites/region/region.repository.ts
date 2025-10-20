import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { createPagedResult, PagedResult } from '@app/common';
import type { Region } from './region.entity';
import { CountryCode } from '../../common/enums';

@Injectable()
export class RegionRepository extends EntityRepository<Region> {
  async findById(id: number): Promise<Region | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByIds(ids: number[]): Promise<Region[]> {
    return this.find({
      id: { $in: ids },
      isDeleted: false,
    } as any);
  }

  async findByName(name: string): Promise<Region | null> {
    return this.findOne({ name, isDeleted: false });
  }

  async findByNameLike(
    name: string,
    page: number,
    limit: number,
  ): Promise<PagedResult<Region>> {
    const regions = await this.find(
      {
        name: { $like: `%${name}%` } as any,
        isDeleted: false,
      },
      {
        limit,
        offset: (page - 1) * limit,
      },
    );

    return createPagedResult(regions, limit);
  }

  async findByNameAndCountryCodeLike(
    page: number,
    limit: number,
    name?: string,
    countryCode?: CountryCode,
  ): Promise<PagedResult<Region>> {
    const whereCondition: any = {
      isDeleted: false,
    };

    // name이 null이 아니거나 빈 문자열이 아닌 경우
    if (name && name.trim() !== '') {
      whereCondition.name = { $like: `%${name}%` } as any;
    }

    if (countryCode) {
      whereCondition.countryCode = countryCode;
    }

    const [entities, totalCount] = await this.findAndCount(whereCondition, {
      limit,
      offset: (page - 1) * limit,
    });

    return {
      contents: entities,
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
