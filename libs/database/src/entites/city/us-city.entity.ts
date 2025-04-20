import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsCityRepository } from './us-city.repository';

@Entity({ repository: () => UsCityRepository, tableName: 'us_city' })
export class UsCity {
  @PrimaryKey()
  private readonly geoid!: string;

  @Property()
  private name!: string;

  @Property({ fieldName: 'state_fips' })
  private state_fips!: string;

  @Property({ fieldName: 'county_fips', nullable: true })
  private county_fips?: string;

  @Property({ nullable: true })
  private latitude?: number;

  @Property({ nullable: true })
  private longitude?: number;

  @Property({ nullable: true })
  private population?: number;

  public getGeoid(): string {
    return this.geoid;
  }

  public getName(): string {
    return this.name;
  }

  public getStateFips(): string {
    return this.state_fips;
  }

  public getCountyFips(): string | undefined {
    return this.county_fips;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }

  public getPopulation(): number | undefined {
    return this.population;
  }
}
