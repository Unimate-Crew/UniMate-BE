import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Terms } from './terms.entity';

@Injectable()
export class TermsRepository extends EntityRepository<Terms> {
  async findById(id: number): Promise<Terms | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findActiveTermsOrderByDisplayOrder(): Promise<Terms[]> {
    return this.find(
      { isActive: true, isDeleted: false },
      { orderBy: { displayOrder: 'ASC' } },
    );
  }

  async persist(terms: Terms): Promise<void> {
    await this.em.persist(terms);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(terms: Terms): Promise<void> {
    await this.em.persistAndFlush(terms);
  }
}
