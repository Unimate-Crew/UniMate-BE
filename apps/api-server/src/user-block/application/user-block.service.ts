import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { UserBlockRepository } from '@app/database/entites/user-block/user-block.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { UserBlock } from '@app/database/entites/user-block/user-block.entity';
import { User } from '@app/database/entites/user/user.entity';
import { ErrorCode } from '@app/common';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly userBlockRepository: UserBlockRepository,
    private readonly userRepository: UserRepository,
  ) {}

  @Transactional()
  async blockUser(params: {
    blockerId: number;
    blockedId: number;
  }): Promise<void> {
    const { blockerId, blockedId } = params;

    // 1. 본인 차단 방지
    if (blockerId === blockedId) {
      throw new BadRequestException({
        code: ErrorCode.USER_BLOCK_SELF_NOT_ALLOWED,
        message: '본인은 차단할 수 없습니다.',
      });
    }

    // 2. 차단할 유저가 존재하는지 확인
    const blockedUser: User | null =
      await this.userRepository.findById(blockedId);
    if (!blockedUser) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '차단할 유저를 찾을 수 없습니다.',
      });
    }

    // 3. 이미 차단되었는지 확인
    const existingBlock: UserBlock | null =
      await this.userBlockRepository.findByBlockerIdAndBlockedId({
        blockerId,
        blockedId,
      });

    if (existingBlock) {
      throw new ConflictException({
        code: ErrorCode.USER_ALREADY_BLOCKED,
        message: '이미 차단된 유저입니다.',
      });
    }

    // 4. 차단 생성
    const userBlock: UserBlock = this.userBlockRepository.create({
      blockerId,
      blockedId,
    });

    await this.userBlockRepository.persistAndFlush(userBlock);
  }

  @Transactional()
  async unblockUser(params: {
    blockerId: number;
    blockedId: number;
  }): Promise<void> {
    const { blockerId, blockedId } = params;

    // 1. 차단 관계 조회
    const userBlock: UserBlock | null =
      await this.userBlockRepository.findByBlockerIdAndBlockedId({
        blockerId,
        blockedId,
      });

    if (!userBlock) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_BLOCKED,
        message: '차단되지 않은 유저입니다.',
      });
    }

    // 2. 차단 해제 (논리적 삭제)
    userBlock.delete();
    await this.userBlockRepository.persistAndFlush(userBlock);
  }
}
