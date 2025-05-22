import {
  Entity,
  PrimaryKey,
  Property,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { RegionRepository } from './region.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => RegionRepository })
export class Region extends BaseEntity {
  @PrimaryKey()
  private readonly id!: string;

  @Property()
  private name!: string;

  @Property()
  private stateId!: string;

  @Property()
  private countyId?: string;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private latitude?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private longitude?: number;

  @Property({ columnType: 'bigint', nullable: true })
  private population?: number;

  @Property({ nullable: true })
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public isRegionDeleted(): boolean {
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
