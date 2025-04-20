import { EntityRepository } from '@mikro-orm/core';
import { PagedResult, createPagedResult } from '@app/common';
import { Injectable } from '@nestjs/common';
import { UsCity } from './us-city.entity';

@Injectable()
export class UsCityRepository extends EntityRepository<UsCity> {
  async findByNameLike(
    name: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PagedResult<UsCity>> {
    const where: any = { name: { $like: `%${name}%` } };

    // offset 계산
    const offset = (page - 1) * limit;

    // 페이지네이션 데이터 조회 (populate 추가)
    const data = await this.find(where, {
      limit,
      offset,
    });

    // 전체 항목 개수 조회
    const totalItems = await this.count(where);

    return createPagedResult(data, page, limit, {
      totalItems,
    });
  }
}
