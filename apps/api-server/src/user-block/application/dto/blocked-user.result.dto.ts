export class BlockedUserResultDto {
  userId: number;

  nickname: string;

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

  static of(
    userId: number,
    nickname: string,
    profileImageUrl: string | null,
  ): BlockedUserResultDto {
    return new BlockedUserResultDto(userId, nickname, profileImageUrl);
  }
}
