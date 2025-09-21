import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ConversationParticipantRepository } from './conversation-participant.repository';
import { BaseEntity } from '../../common/base.entity';
import { ConversationParticipantStatus } from '../../common/enums';

@Entity({ repository: () => ConversationParticipantRepository })
export class ConversationParticipant extends BaseEntity {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property({ type: 'bigint' })
  conversationId!: number;

  @Property()
  userId!: number;

  @Property({ type: 'bigint' })
  lastReadMessageNumber: number = 0;

  @Property({ nullable: true })
  leftAt?: Date;

  @Property({ type: 'json' })
  status: ConversationParticipantStatus[] = [
    ConversationParticipantStatus.JOIN,
  ];

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

  public getStatus(): ConversationParticipantStatus[] {
    return this.status;
  }

  public setStatus(status: ConversationParticipantStatus[]): void {
    this.status = status;
  }

  public isParticipantDeleted(): boolean {
    return this.isDeleted;
  }

  public isJoined(): boolean {
    return this.status.includes(ConversationParticipantStatus.JOIN);
  }

  public isBlocked(): boolean {
    return this.status.includes(ConversationParticipantStatus.BLOCK);
  }

  public isMuted(): boolean {
    return this.status.includes(ConversationParticipantStatus.MUTE);
  }

  public isLeft(): boolean {
    return this.status.includes(ConversationParticipantStatus.LEFT);
  }

  public hasStatus(status: ConversationParticipantStatus): boolean {
    return this.status.includes(status);
  }

  public addStatus(status: ConversationParticipantStatus): void {
    if (!this.hasStatus(status)) {
      this.status.push(status);
    }
  }

  public removeStatus(status: ConversationParticipantStatus): void {
    this.status = this.status.filter((s) => s !== status);
  }

  public leaveConversation(): void {
    this.removeStatus(ConversationParticipantStatus.JOIN);
    this.addStatus(ConversationParticipantStatus.LEFT);
    this.leftAt = new Date();
  }
}
