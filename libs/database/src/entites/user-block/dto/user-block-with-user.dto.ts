export class UserBlockWithUser {
  readonly id: number;

  readonly blockerId: number;

  readonly blockedId: number;

  readonly createdAt: Date;

  readonly userId: number;

  readonly nickname: string;

  readonly profileImageKey: string | null;

  constructor(params: {
    id: number;
    blockerId: number;
    blockedId: number;
    createdAt: Date;
    userId: number;
    nickname: string;
    profileImageKey: string | null;
  }) {
    this.id = params.id;
    this.blockerId = params.blockerId;
    this.blockedId = params.blockedId;
    this.createdAt = params.createdAt;
    this.userId = params.userId;
    this.nickname = params.nickname;
    this.profileImageKey = params.profileImageKey;
  }

  static of(data: {
    id: number;
    blockerId: number;
    blockedId: number;
    createdAt: Date;
    userId: number;
    nickname: string;
    profileImageKey: string | null;
  }): UserBlockWithUser {
    return new UserBlockWithUser(data);
  }
}
