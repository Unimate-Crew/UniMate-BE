export class ConversationParticipantCache {
  private userId: number;

  private lastReadMessageNumber: number;

  private isBlockingOther: boolean;

  private isMuted: boolean;

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

  public getUserId(): number {
    return this.userId;
  }

  public getLastReadMessageNumber(): number {
    return this.lastReadMessageNumber;
  }

  public getIsBlockingOther(): boolean {
    return this.isBlockingOther;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLastReadMessageNumber(messageNumber: number): void {
    this.lastReadMessageNumber = messageNumber;
  }

  public checkIsBlockingOther(): boolean {
    return this.isBlockingOther;
  }

  public checkIsMuted(): boolean {
    return this.isMuted;
  }

  public serialize(): string {
    return JSON.stringify(this.toJSON());
  }

  public static deserialize(data: string): ConversationParticipantCache {
    const parsed = JSON.parse(data);
    return ConversationParticipantCache.from(parsed);
  }

  public static from(data: {
    userId: number;
    lastReadMessageNumber?: number;
    isBlockingOther: boolean;
    isMuted: boolean;
  }): ConversationParticipantCache {
    return new ConversationParticipantCache(
      data.userId,
      data.lastReadMessageNumber || 0,
      data.isBlockingOther,
      data.isMuted,
    );
  }

  public toJSON(): {
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
