import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { InterestRegionRepository } from './interest-region.repository';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../user/user.entity';
import { Region } from '../region/region.entity';

@Entity({ repository: () => InterestRegionRepository })
export class InterestRegion extends BaseEntity {
  @PrimaryKey()
  private readonly id!: number;

  @ManyToOne(() => Region)
  private region!: Region;

  @ManyToOne(() => User)
  private user!: User;

  @Property()
  private isPrimary: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getRegion(): Region {
    return this.region;
  }

  public setRegion(region: Region): void {
    this.region = region;
  }

  public getUser(): User {
    return this.user;
  }

  public setUser(user: User): void {
    this.user = user;
  }

  public getIsPrimary(): boolean {
    return this.isPrimary;
  }

  public setPrimary(isPrimary: boolean): void {
    this.isPrimary = isPrimary;
  }
}
