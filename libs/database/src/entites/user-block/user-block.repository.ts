import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { CursorSlice } from '@app/common';
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
    cursor?: number;
    size: number;
  }): Promise<CursorSlice<UserBlockWithUser>> {
    const knex = this.em.getKnex();

    let query = knex
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
      .where('user.is_deleted', false);

    // 커서가 있으면 해당 ID보다 작은 것만 조회 (내림차순이므로)
    if (params.cursor !== undefined) {
      query = query.where('user_block.id', '<', params.cursor);
    }

    const results = await query
      .orderBy('user_block.id', 'DESC')
      .limit(params.size + 1);

    // CursorSlice.fromData를 사용하여 결과 생성
    const mappedResults = results.map((row) =>
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

    return CursorSlice.fromData(mappedResults, params.size, (item) => item.id);
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

  /**
   * 특정 사용자가 차단한 모든 기록을 소프트 딜리트 처리합니다.
   * @param blockerId 차단자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByBlockerId(blockerId: number): Promise<number> {
    return this.nativeUpdate(
      { blockerId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
