import { Property } from '@mikro-orm/core';

export abstract class BaseEntity {
  @Property({ default: false })
  protected isDeleted: boolean = false;

  @Property()
  protected createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  protected updatedAt: Date = new Date();

  @Property({ nullable: true })
  protected deletedAt?: Date;

  public getIsDeleted(): boolean {
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
