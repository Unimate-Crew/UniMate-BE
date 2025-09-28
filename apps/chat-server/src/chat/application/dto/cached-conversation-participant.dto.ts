export class CachedConversationParticipantDto {
  userId: number;

  lastReadMessageNumber: number;

  isBlockingOther: boolean;

  isMuted: boolean;

  constructor(
    userId: number,
    lastReadMessageNumber: number,
    isBlockingOther: boolean,
    isMuted: boolean,
  ) {
    this.userId = userId;
    this.lastReadMessageNumber = lastReadMessageNumber;
    this.isBlockingOther = isBlockingOther;
    this.isMuted = isMuted;
  }

  static from(data: {
    userId: number;
    lastReadMessageNumber?: number;
    isBlockingOther: boolean;
    isMuted: boolean;
  }): CachedConversationParticipantDto {
    return new CachedConversationParticipantDto(
      data.userId,
      data.lastReadMessageNumber || 0,
      data.isBlockingOther,
      data.isMuted,
    );
  }

  toJSON(): {
    userId: number;
    lastReadMessageNumber: number;
    isBlockingOther: boolean;
    isMuted: boolean;
  } {
    return {
      userId: this.userId,
      lastReadMessageNumber: this.lastReadMessageNumber,
      isBlockingOther: this.isBlockingOther,
      isMuted: this.isMuted,
    };
  }
}
