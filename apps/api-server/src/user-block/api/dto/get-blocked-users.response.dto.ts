// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { CursorSlice } from '@app/common';
import { BlockedUserResultDto } from '../../application/dto/blocked-user.result.dto';

export class BlockedUserItemDto {
  @ApiProperty({
    description: '유저 차단 ID',
    example: 456,
  })
  userBlockId: number;

  @ApiProperty({
    description: '차단된 유저 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '차단된 유저 닉네임',
    example: '차단된유저',
  })
  nickname: string;

  @ApiProperty({
    description: '차단된 유저 프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profileImageUrl: string | null;

  constructor(
    userBlockId: number,
    userId: number,
    nickname: string,
    profileImageUrl: string | null,
  ) {
    this.userBlockId = userBlockId;
    this.userId = userId;
    this.nickname = nickname;
    this.profileImageUrl = profileImageUrl;
  }
}

export class GetBlockedUsersResponseDto {
  @ApiProperty({
    description: '차단한 유저 목록',
    type: [BlockedUserItemDto],
  })
  contents: BlockedUserItemDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: '다음 커서 (다음 페이지 요청 시 사용)',
    example: 123,
    nullable: true,
  })
  nextCursor: number | null;

  constructor(
    contents: BlockedUserItemDto[],
    hasNext: boolean,
    nextCursor: number | null,
  ) {
    this.contents = contents;
    this.hasNext = hasNext;
    this.nextCursor = nextCursor;
  }

  static of(
    blockedUsersSlice: CursorSlice<BlockedUserResultDto>,
  ): GetBlockedUsersResponseDto {
    const contents: BlockedUserItemDto[] = blockedUsersSlice.contents.map(
      (user) =>
        new BlockedUserItemDto(
          user.userBlockId,
          user.userId,
          user.nickname,
          user.profileImageUrl,
        ),
    );

    return new GetBlockedUsersResponseDto(
      contents,
      blockedUsersSlice.hasNext,
      blockedUsersSlice.nextCursor,
    );
  }
}
