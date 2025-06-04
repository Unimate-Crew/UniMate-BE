import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { InterestRegion } from './interest-region.entity';

@Injectable()
export class InterestRegionRepository extends EntityRepository<InterestRegion> {
  async findById(id: number): Promise<InterestRegion | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<InterestRegion[]> {
    return this.createQueryBuilder('ir')
      .select('*')
      .where({ 'ir.user_id': userId, 'ir.is_deleted': false })
      .getResult();
  }

  async findWithRegionByUserId(userId: number): Promise<InterestRegion[]> {
    return this.createQueryBuilder('ir')
      .select('*')
      .joinAndSelect('ir.region', 'r')
      .where({ 'ir.user_id': userId, 'ir.is_deleted': false })
      .getResult();
  }

  async findPrimaryByUserId(userId: number): Promise<InterestRegion | null> {
    return this.createQueryBuilder('ir')
      .select('*')
      .where({
        'ir.user_id': userId,
        'ir.is_primary': true,
        'ir.is_deleted': false,
      })
      .getSingleResult();
  }

  async findByRegionId(regionId: string): Promise<InterestRegion[]> {
    return this.createQueryBuilder('ir')
      .select('*')
      .where({ 'ir.region_id': regionId, 'ir.is_deleted': false })
      .getResult();
  }

  async findByUserIdAndRegionId(
    userId: number,
    regionId: string,
  ): Promise<InterestRegion | null> {
    return this.createQueryBuilder('ir')
      .select('*')
      .where({
        'ir.user_id': userId,
        'ir.region_id': regionId,
        'ir.is_deleted': false,
      })
      .getSingleResult();
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
