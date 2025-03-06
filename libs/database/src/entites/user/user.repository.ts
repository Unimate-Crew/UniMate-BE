import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { User } from './user.entity';

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async persist(user: User): Promise<void> {
    await this.em.persist(user);
  }

  async persistAndFlush(user: User): Promise<void> {
    await this.em.persistAndFlush(user);
  }
}
