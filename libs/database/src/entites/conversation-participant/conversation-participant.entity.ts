import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ConversationParticipantRepository } from './conversation-participant.repository';
import { BaseEntity } from '../../common/base.entity';

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

  @Property({ type: 'boolean' })
  isBlockingOther: boolean = false;

  @Property({ type: 'boolean' })
  isMuted: boolean = false;

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

  public getIsBlockingOther(): boolean {
    return this.isBlockingOther;
  }

  public setIsBlockingOther(isBlockingOther: boolean): void {
    this.isBlockingOther = isBlockingOther;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setIsMuted(isMuted: boolean): void {
    this.isMuted = isMuted;
  }

  public isParticipantDeleted(): boolean {
    return this.isDeleted;
  }

  public isActive(): boolean {
    return !this.leftAt;
  }

  public hasLeft(): boolean {
    return !!this.leftAt;
  }

  public leaveConversation(): void {
    this.leftAt = new Date();
  }
}
