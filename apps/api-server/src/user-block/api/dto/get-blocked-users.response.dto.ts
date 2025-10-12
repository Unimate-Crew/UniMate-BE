// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { Slice } from '@app/common';
import { BlockedUserResultDto } from '../../application/dto/blocked-user.result.dto';

export class BlockedUserItemDto {
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
    userId: number,
    nickname: string,
    profileImageUrl: string | null,
  ) {
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

  constructor(contents: BlockedUserItemDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static of(
    blockedUsersSlice: Slice<BlockedUserResultDto>,
  ): GetBlockedUsersResponseDto {
    const contents: BlockedUserItemDto[] = blockedUsersSlice.contents.map(
      (user) =>
        new BlockedUserItemDto(
          user.userId,
          user.nickname,
          user.profileImageUrl,
        ),
    );

    return new GetBlockedUsersResponseDto(contents, blockedUsersSlice.hasNext);
  }
}
