import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { ConversationParticipantRepository } from './conversation-participant.repository';
import { BaseEntity } from '../../common/base.entity';
import { ConversationParticipantStatus } from '../../common/enums';

@Entity({ repository: () => ConversationParticipantRepository })
export class ConversationParticipant extends BaseEntity {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property()
  conversationId!: number;

  @Property()
  userId!: number;

  @Property({ nullable: true })
  lastReadMessageNumber?: number;

  @Property({ nullable: true })
  leftAt?: Date;

  @Enum(() => ConversationParticipantStatus)
  status: ConversationParticipantStatus = ConversationParticipantStatus.JOIN;

  public getId(): number {
    return this.id;
  }

  public getConversationId(): number {
    return this.conversationId;
  }

  public setConversationId(conversationId: number): void {
    this.conversationId = conversationId;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public getLastReadMessageNumber(): number | undefined {
    return this.lastReadMessageNumber;
  }

  public setLastReadMessageNumber(lastReadMessageNumber: number): void {
    this.lastReadMessageNumber = lastReadMessageNumber;
  }

  public getLeftAt(): Date | undefined {
    return this.leftAt;
  }

  public setLeftAt(leftAt: Date): void {
    this.leftAt = leftAt;
  }

  public getStatus(): ConversationParticipantStatus {
    return this.status;
  }

  public setStatus(status: ConversationParticipantStatus): void {
    this.status = status;
  }

  public isParticipantDeleted(): boolean {
    return this.isDeleted;
  }

  public isJoined(): boolean {
    return this.status === ConversationParticipantStatus.JOIN;
  }

  public isBlocked(): boolean {
    return this.status === ConversationParticipantStatus.BLOCK;
  }

  public isMuted(): boolean {
    return this.status === ConversationParticipantStatus.MUTE;
  }

  public leaveConversation(): void {
    this.leftAt = new Date();
  }
}
