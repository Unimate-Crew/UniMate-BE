import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Report } from './report.entity';

@Injectable()
export class ReportRepository extends EntityRepository<Report> {
  async findById(id: number): Promise<Report | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<Report[]> {
    return this.find({ userId, isDeleted: false });
  }

  async findByTargetUserId(targetUserId: number): Promise<Report[]> {
    return this.find({ targetUserId, isDeleted: false });
  }

  async findByUserIdAndTargetUserId(
    userId: number,
    targetUserId: number,
  ): Promise<Report | null> {
    return this.findOne({ userId, targetUserId, isDeleted: false });
  }

  async persist(report: Report): Promise<void> {
    await this.em.persist(report);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(report: Report): Promise<void> {
    await this.em.persistAndFlush(report);
  }

  /**
   * 특정 사용자가 작성한 모든 신고를 소프트 딜리트 처리합니다.
   * @param userId 신고 작성자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByUserId(userId: number): Promise<number> {
    return this.nativeUpdate(
      { userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
