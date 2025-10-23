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
}
