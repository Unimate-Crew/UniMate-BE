export class BlockedUserResultDto {
  userBlockId: number;

  userId: number;

  nickname: string;

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

  static of(
    userBlockId: number,
    userId: number,
    nickname: string,
    profileImageUrl: string | null,
  ): BlockedUserResultDto {
    return new BlockedUserResultDto(
      userBlockId,
      userId,
      nickname,
      profileImageUrl,
    );
  }
}
