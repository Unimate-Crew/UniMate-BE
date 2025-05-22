import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { UserBlock } from './user-block.entity';

@Injectable()
export class UserBlockRepository extends EntityRepository<UserBlock> {
  async findById(id: number): Promise<UserBlock | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByBlockerId(blockerId: number): Promise<UserBlock[]> {
    return this.find({ blockerId, isDeleted: false });
  }

  async findByBlockedId(blockedId: number): Promise<UserBlock[]> {
    return this.find({ blockedId, isDeleted: false });
  }

  async findByBlockerIdAndBlockedId(
    blockerId: number,
    blockedId: number,
  ): Promise<UserBlock | null> {
    return this.findOne({ blockerId, blockedId, isDeleted: false });
  }

  async persist(userBlock: UserBlock): Promise<void> {
    await this.em.persist(userBlock);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(userBlock: UserBlock): Promise<void> {
    await this.em.persistAndFlush(userBlock);
  }
}
