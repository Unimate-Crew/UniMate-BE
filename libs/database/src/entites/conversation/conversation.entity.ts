import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ConversationRepository } from './conversation.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => ConversationRepository })
export class Conversation extends BaseEntity {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property()
  productPostId!: number;

  @Property({ type: 'bigint' })
  lastMessageNumber: number = 0;

  @Property({ nullable: true })
  lastSentAt?: Date;

  public getId(): number {
    return this.id;
  }

  public getProductPostId(): number {
    return this.productPostId;
  }

  public setProductPostId(productPostId: number): void {
    this.productPostId = productPostId;
  }

  public getLastMessageNumber(): number | undefined {
    return this.lastMessageNumber;
  }

  public setLastMessageNumber(lastMessageNumber: number): void {
    this.lastMessageNumber = lastMessageNumber;
  }

  public getLastSentAt(): Date | undefined {
    return this.lastSentAt;
  }

  public setLastSentAt(lastSentAt: Date): void {
    this.lastSentAt = lastSentAt;
  }

  public isConversationDeleted(): boolean {
    return this.isDeleted;
  }
}
