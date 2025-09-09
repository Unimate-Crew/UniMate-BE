import { ConversationParticipantStatus } from '@app/database';

export class CachedConversationParticipantDto {
  userId: number;

  lastReadMessageNumber: number;

  status: ConversationParticipantStatus;

  constructor(
    userId: number,
    lastReadMessageNumber: number,
    status: ConversationParticipantStatus,
  ) {
    this.userId = userId;
    this.lastReadMessageNumber = lastReadMessageNumber;
    this.status = status;
  }

  static from(data: {
    userId: number;
    lastReadMessageNumber?: number;
    status: ConversationParticipantStatus;
  }): CachedConversationParticipantDto {
    return new CachedConversationParticipantDto(
      data.userId,
      data.lastReadMessageNumber || 0,
      data.status,
    );
  }

  toJSON(): {
    userId: number;
    lastReadMessageNumber: number;
    status: ConversationParticipantStatus;
  } {
    return {
      userId: this.userId,
      lastReadMessageNumber: this.lastReadMessageNumber,
      status: this.status,
    };
  }
}
