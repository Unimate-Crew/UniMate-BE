import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsCountyRepository } from './us-county.repository';

@Entity({ repository: () => UsCountyRepository, tableName: 'us_county' })
export class UsCounty {
  @PrimaryKey()
  private readonly geoid!: string;

  @Property()
  private name!: string;

  @Property({ fieldName: 'state_fips' })
  private state_fips!: string;

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

  public getStateFips(): string {
    return this.state_fips;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }
}
