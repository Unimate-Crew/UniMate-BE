import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { ConversationMessageRepository } from './conversation-message.repository';
import { BaseEntity } from '../../common/base.entity';
import { ConversationMessageType } from '../../common/enums';

@Entity({ repository: () => ConversationMessageRepository })
export class ConversationMessage extends BaseEntity {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property()
  conversationId!: number;

  @Property()
  senderId!: number;

  @Property({ type: 'bigint' })
  messageNumber!: number;

  @Property({ nullable: true, type: 'text' })
  content?: string;

  @Enum(() => ConversationMessageType)
  type: ConversationMessageType = ConversationMessageType.TEXT;

  public getId(): number {
    return this.id;
  }

  public getConversationId(): number {
    return this.conversationId;
  }

  public setConversationId(conversationId: number): void {
    this.conversationId = conversationId;
  }

  public getSenderId(): number {
    return this.senderId;
  }

  public setSenderId(senderId: number): void {
    this.senderId = senderId;
  }

  public getMessageNumber(): number {
    return this.messageNumber;
  }

  public setMessageNumber(messageNumber: number): void {
    this.messageNumber = messageNumber;
  }

  public getContent(): string | undefined {
    return this.content;
  }

  public setContent(content: string): void {
    this.content = content;
  }

  public getType(): ConversationMessageType {
    return this.type;
  }

  public setType(type: ConversationMessageType): void {
    this.type = type;
  }

  public isMessageDeleted(): boolean {
    return this.isDeleted;
  }

  public isTextMessage(): boolean {
    return this.type === ConversationMessageType.TEXT;
  }

  public isImageMessage(): boolean {
    return this.type === ConversationMessageType.IMAGE;
  }

  public isVideoMessage(): boolean {
    return this.type === ConversationMessageType.VIDEO;
  }

  public isSystemMessage(): boolean {
    return this.type === ConversationMessageType.SYSTEM;
  }

  public isSentBy(userId: number): boolean {
    return this.senderId === userId;
  }
}
