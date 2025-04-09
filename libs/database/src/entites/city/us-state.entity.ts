import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsStateRepository } from './us-state.repository';

@Entity({ repository: () => UsStateRepository, tableName: 'us_state' })
export class UsState {
  @PrimaryKey()
  private readonly geoid!: string;

  @Property()
  private name!: string;

  @Property({ nullable: true })
  private stusab?: string;

  @Property({ nullable: true })
  private latitude?: number;

  @Property({ nullable: true })
  private longitude?: number;

  public getGeoid(): string {
    return this.geoid;
  }

  public getName(): string {
    return this.name;
  }

  public getStusab(): string | undefined {
    return this.stusab;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }
}
