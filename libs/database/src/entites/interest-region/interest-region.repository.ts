import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { InterestRegion } from './interest-region.entity';
import { InterestRegionWithRegion } from './dto/interest-region-wiht-region';
import { Region } from '../region/region.entity';

@Injectable()
export class InterestRegionRepository extends EntityRepository<InterestRegion> {
  async findById(id: number): Promise<InterestRegion | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<InterestRegion[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findWithRegionByUserId(
    userId: number,
  ): Promise<InterestRegionWithRegion[]> {
    const knex = this.em.getKnex();
    const results = await knex
      .select([
        'interest_region.*',
        'region.id as region_id',
        'region.name as region_name',
        'region.state_id',
        'region.county_id',
        'region.latitude',
        'region.longitude',
        'region.population',
        'region.created_at as region_created_at',
        'region.updated_at as region_updated_at',
        'region.deleted_at as region_deleted_at',
        'region.is_deleted as region_is_deleted',
      ])
      .from('interest_region')
      .join('region', 'interest_region.region_id', 'region.id')
      .where('interest_region.user_id', userId)
      .andWhere('interest_region.is_deleted', false);

    return results.map((row) => {
      const interestRegion = this.em.map(InterestRegion, {
        id: row.id,
        userId: row.user_id,
        regionId: row.region_id,
        isPrimary: row.is_primary,
        isDeleted: row.is_deleted,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      });

      const region = this.em.map(Region, {
        id: row.region_id,
        name: row.region_name,
        stateId: row.state_id,
        countyId: row.county_id,
        latitude: row.latitude,
        longitude: row.longitude,
        population: row.population,
        createdAt: row.region_created_at,
        updatedAt: row.region_updated_at,
        deletedAt: row.region_deleted_at,
        isDeleted: row.region_is_deleted,
      });

      return new InterestRegionWithRegion(interestRegion, region);
    });
  }

  async findPrimaryByUserId(userId: number): Promise<InterestRegion | null> {
    return this.findOne({ userId, isPrimary: true, isDeleted: false });
  }

  async findByRegionId(regionId: string): Promise<InterestRegion[]> {
    return this.find({ regionId, isDeleted: false });
  }

  async findByUserIdAndRegionId(
    userId: number,
    regionId: string,
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
