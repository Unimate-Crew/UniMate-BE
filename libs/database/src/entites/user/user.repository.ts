import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { User, OAuthProvider } from './user.entity';

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async findById(id: number): Promise<User | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByProviderId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return this.findOne({ provider, providerId, isDeleted: false });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.findOne({ nickname, isDeleted: false });
  }

  async findByIds(ids: number[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.find({
      id: { $in: ids },
      isDeleted: false,
    });
  }

  async persist(user: User): Promise<void> {
    await this.em.persist(user);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(user: User): Promise<void> {
    await this.em.persistAndFlush(user);
  }
}
