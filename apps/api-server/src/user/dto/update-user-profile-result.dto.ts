import { User } from '@app/database';

export class UpdateUserProfileResultDto {
  private constructor(
    readonly nickname: string,
    readonly profileImageKey: string | undefined,
  ) {}

  static from(user: User): UpdateUserProfileResultDto {
    return new UpdateUserProfileResultDto(
      user.getNickname(),
      user.getProfileImageKey(),
    );
  }
}
