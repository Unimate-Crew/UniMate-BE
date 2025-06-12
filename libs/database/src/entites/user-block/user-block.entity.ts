import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UserBlockRepository } from './user-block.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => UserBlockRepository })
export class UserBlock extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  blockerId!: number;

  @Property()
  blockedId!: number;

  public getId(): number {
    return this.id;
  }

  public getBlockerId(): number {
    return this.blockerId;
  }

  public setBlockerId(blockerId: number): void {
    this.blockerId = blockerId;
  }

  public getBlockedId(): number {
    return this.blockedId;
  }

  public setBlockedId(blockedId: number): void {
    this.blockedId = blockedId;
  }

  public isUserBlockDeleted(): boolean {
    return this.isDeleted;
  }

  public delete(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }
}
