export class UpdateUserProfileResultDto {
  private constructor(
    readonly nickname?: string,
    readonly profileImageUrl?: string,
  ) {}

  static of(
    nickname?: string,
    profileImageUrl?: string,
  ): UpdateUserProfileResultDto {
    return new UpdateUserProfileResultDto(nickname, profileImageUrl);
  }
}
