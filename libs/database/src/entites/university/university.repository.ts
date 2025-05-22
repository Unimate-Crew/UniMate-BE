import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
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
}
