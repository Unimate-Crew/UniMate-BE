import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Slice, PageRequest } from '@app/common';
import type { UserBlock } from './user-block.entity';
import { UserBlockWithUser } from './dto/user-block-with-user.dto';

@Injectable()
export class UserBlockRepository extends EntityRepository<UserBlock> {
  async findById(id: number): Promise<UserBlock | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByBlockerId(blockerId: number): Promise<UserBlock[]> {
    return this.find({ blockerId, isDeleted: false });
  }

  async findPagedByBlockerId(params: {
    blockerId: number;
    pageRequest: PageRequest;
  }): Promise<Slice<UserBlockWithUser>> {
    const knex = this.em.getKnex();

    const results = await knex
      .select([
        'user_block.id',
        'user_block.blocker_id as blockerId',
        'user_block.blocked_id as blockedId',
        'user_block.created_at as createdAt',
        'user.id as userId',
        'user.nickname',
        'user.profile_image_key as profileImageKey',
      ])
      .from('user_block')
      .innerJoin('user', 'user_block.blocked_id', 'user.id')
      .where('user_block.blocker_id', params.blockerId)
      .where('user_block.is_deleted', false)
      .where('user.is_deleted', false)
      .orderBy('user_block.created_at', 'DESC')
      .limit(params.pageRequest.getLimit() + 1)
      .offset(params.pageRequest.getOffset());

    const hasNext = results.length > params.pageRequest.getLimit();
    const content = hasNext ? results.slice(0, -1) : results;

    const mappedContent = content.map((row) =>
      UserBlockWithUser.of({
        id: row.id,
        blockerId: row.blockerId,
        blockedId: row.blockedId,
        createdAt: row.createdAt,
        userId: row.userId,
        nickname: row.nickname,
        profileImageKey: row.profileImageKey,
      }),
    );

    return Slice.of(mappedContent, hasNext);
  }

  async findByBlockedId(blockedId: number): Promise<UserBlock[]> {
    return this.find({ blockedId, isDeleted: false });
  }

  async findByBlockerIdAndBlockedId(params: {
    blockerId: number;
    blockedId: number;
  }): Promise<UserBlock | null> {
    return this.findOne({
      blockerId: params.blockerId,
      blockedId: params.blockedId,
      isDeleted: false,
    });
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
