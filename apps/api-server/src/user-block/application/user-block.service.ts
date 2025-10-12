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
import { ErrorCode, CursorSlice } from '@app/common';
import { S3Service } from '@app/common/s3/s3.service';
import { UserBlockWithUser } from '@app/database/entites/user-block/dto/user-block-with-user.dto';
import { BlockedUserResultDto } from './dto/blocked-user.result.dto';

@Injectable()
export class UserBlockService {
  constructor(
    private readonly userBlockRepository: UserBlockRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Service: S3Service,
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

  /**
   * 내가 차단한 유저 목록을 커서 기반 페이지네이션하여 조회합니다.
   *
   * @param params.userId 현재 로그인한 유저 ID
   * @param params.cursor 커서 (이전 응답의 nextCursor 값)
   * @param params.size 페이지당 항목 수
   * @returns 차단한 유저 목록, 다음 페이지 존재 여부, 다음 커서
   */
  async getBlockedUsers(params: {
    userId: number;
    cursor?: number;
    size: number;
  }): Promise<CursorSlice<BlockedUserResultDto>> {
    // 1. Repository에서 이미 JOIN된 결과 조회
    const userBlocksSlice: CursorSlice<UserBlockWithUser> =
      await this.userBlockRepository.findPagedByBlockerId({
        blockerId: params.userId,
        cursor: params.cursor,
        size: params.size,
      });

    // 2. S3 URL 생성 및 DTO 변환
    const blockedUserResults: BlockedUserResultDto[] = await Promise.all(
      userBlocksSlice.contents.map(async (userBlock) => {
        let profileImageUrl: string | null = null;
        if (userBlock.profileImageKey) {
          profileImageUrl = await this.s3Service.generateGetPresignedUrl(
            userBlock.profileImageKey,
          );
        }

        return BlockedUserResultDto.of(
          userBlock.id,
          userBlock.userId,
          userBlock.nickname,
          profileImageUrl,
        );
      }),
    );

    return CursorSlice.of(
      blockedUserResults,
      userBlocksSlice.hasNext,
      userBlocksSlice.nextCursor,
    );
  }
}
