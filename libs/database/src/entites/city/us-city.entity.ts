import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
// eslint-disable-next-line import/no-cycle
import { UsCityRepository } from './us-city.repository';

@Entity({ repository: () => UsCityRepository, tableName: 'us_city' })
export class UsCity {
  @PrimaryKey()
  private readonly id!: string;

  @Property()
  private name!: string;

  @Property({ fieldName: 'state_id' })
  private stateId!: string;

  @Property({ fieldName: 'county_id', nullable: true })
  private countyId?: string;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private latitude?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private longitude?: number;

  @Property({ columnType: 'bigint', nullable: true })
  private population?: number;

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getStateId(): string {
    return this.stateId;
  }

  public getCountyId(): string | undefined {
    return this.countyId;
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
