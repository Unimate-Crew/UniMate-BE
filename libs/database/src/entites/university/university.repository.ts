import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Slice, PageRequest } from '@app/common';
import type { University } from './university.entity';

@Injectable()
export class UniversityRepository extends EntityRepository<University> {
  async findById(id: number): Promise<University | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByName(name: string): Promise<University | null> {
    return this.findOne({ name, isDeleted: false });
  }

  async findByDomain(domain: string): Promise<University | null> {
    return this.findOne({ domain, isDeleted: false });
  }

  async findAllActive(): Promise<University[]> {
    return this.find({ isDeleted: false });
  }

  async persist(university: University): Promise<void> {
    await this.em.persist(university);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(university: University): Promise<void> {
    await this.em.persistAndFlush(university);
  }

  /**
   * 대학교를 검색합니다.
   * 이름으로 검색하고 페이지네이션을 적용합니다.
   *
   * @param params.name 대학교 이름 (검색 키워드)
   * @param params.pageRequest 페이지 요청 정보
   * @returns 페이지네이션된 대학교 목록
   */
  async searchUniversities(params: {
    name?: string;
    pageRequest: PageRequest;
  }): Promise<Slice<University>> {
    const qb = this.createQueryBuilder('university');

    qb.where({ isDeleted: false });

    // 이름 검색
    if (params.name) {
      qb.andWhere({ name: { $like: `%${params.name}%` } });
    }

    const results: University[] = await qb
      .orderBy({ id: 'ASC' })
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset())
      .getResultList();

    const hasNext: boolean = results.length > params.pageRequest.getLimit();
    const content: University[] = hasNext ? results.slice(0, -1) : results;

    return Slice.of(content, hasNext);
  }
}
