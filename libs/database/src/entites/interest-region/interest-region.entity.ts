import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { InterestRegionRepository } from './interest-region.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => InterestRegionRepository })
export class InterestRegion extends BaseEntity {
  @PrimaryKey()
  private readonly id!: number;

  @Property()
  private regionId!: string;

  @Property()
  private userId!: number;

  @Property()
  private isPrimary: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getRegionId(): string {
    return this.regionId;
  }

  public setRegionId(regionId: string): void {
    this.regionId = regionId;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public getIsPrimary(): boolean {
    return this.isPrimary;
  }

  public setPrimary(isPrimary: boolean): void {
    this.isPrimary = isPrimary;
  }
}
