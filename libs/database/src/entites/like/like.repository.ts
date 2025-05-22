import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import type { Like } from './like.entity';

@Injectable()
export class LikeRepository extends EntityRepository<Like> {
  async findById(id: number): Promise<Like | null> {
    return this.findOne({ id });
  }

  async findByProductId(productId: number): Promise<Like[]> {
    return this.find({ productId });
  }

  async findByUserId(userId: number): Promise<Like[]> {
    return this.find({ userId });
  }

  async findByProductIdAndUserId(
    productId: number,
    userId: number,
  ): Promise<Like | null> {
    return this.findOne({ productId, userId });
  }

  async countByProductId(productId: number): Promise<number> {
    return this.count({ productId });
  }

  async persist(like: Like): Promise<void> {
    await this.em.persist(like);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(like: Like): Promise<void> {
    await this.em.persistAndFlush(like);
  }

  async remove(like: Like): Promise<void> {
    await this.em.remove(like);
  }

  async removeAndFlush(like: Like): Promise<void> {
    await this.em.removeAndFlush(like);
  }
}
