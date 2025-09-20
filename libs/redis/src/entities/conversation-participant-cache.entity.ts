import { ConversationParticipantStatus } from '@app/database';

export class ConversationParticipantCache {
  private userId: number;
  private lastReadMessageNumber: number;
  private status: ConversationParticipantStatus[];

  constructor(
    userId: number,
    lastReadMessageNumber: number,
    status: ConversationParticipantStatus[],
  ) {
    this.userId = userId;
    this.lastReadMessageNumber = lastReadMessageNumber;
    this.status = status;
  }

  public getUserId(): number {
    return this.userId;
  }

  public getLastReadMessageNumber(): number {
    return this.lastReadMessageNumber;
  }

  public getStatus(): ConversationParticipantStatus[] {
    return this.status;
  }

  public setLastReadMessageNumber(messageNumber: number): void {
    this.lastReadMessageNumber = messageNumber;
  }

  public isJoined(): boolean {
    return this.status.includes(ConversationParticipantStatus.JOIN);
  }

  public isMuted(): boolean {
    return this.status.includes(ConversationParticipantStatus.MUTE);
  }

  public isLeft(): boolean {
    return this.status.includes(ConversationParticipantStatus.LEFT);
  }

  public isBlocked(): boolean {
    return this.status.includes(ConversationParticipantStatus.BLOCK);
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
    status: ConversationParticipantStatus[];
  }): ConversationParticipantCache {
    return new ConversationParticipantCache(
      data.userId,
      data.lastReadMessageNumber || 0,
      data.status,
    );
  }

  public toJSON(): {
    userId: number;
    lastReadMessageNumber: number;
    status: ConversationParticipantStatus[];
  } {
    return {
      userId: this.userId,
      lastReadMessageNumber: this.lastReadMessageNumber,
      status: this.status,
    };
  }
}