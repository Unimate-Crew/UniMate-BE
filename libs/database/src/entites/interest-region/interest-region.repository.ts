import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { InterestRegion } from './interest-region.entity';
import { User } from '../user/user.entity';
import { Region } from '../region/region.entity';

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

  async findByRegionId(regionId: number): Promise<InterestRegion[]> {
    return this.createQueryBuilder('ir')
      .select('*')
      .where({ 'ir.region_id': regionId, 'ir.is_deleted': false })
      .getResult();
  }

  async findByUserIdAndRegionId(
    userId: number,
    regionId: number,
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

  /**
   * 특정 사용자의 모든 관심 지역을 소프트 딜리트 처리합니다.
   * @param userId 사용자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByUserId(userId: number): Promise<number> {
    const result = await this.createQueryBuilder('ir')
      .update({ isDeleted: true, deletedAt: new Date() })
      .where({ 'ir.user_id': userId, 'ir.is_deleted': false })
      .execute();
    return result.affectedRows;
  }
}
