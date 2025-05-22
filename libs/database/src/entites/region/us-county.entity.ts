import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsCountyRepository } from './us-county.repository';

@Entity({ repository: () => UsCountyRepository, tableName: 'us_county' })
export class UsCounty {
  @PrimaryKey()
  private readonly id!: string;

  @Property()
  private name!: string;

  @Property({ fieldName: 'state_id' })
  private stateId!: string;

  @Property({ fieldName: 'land_area', columnType: 'bigint', nullable: true })
  private landArea?: number;

  @Property({ fieldName: 'water_area', columnType: 'bigint', nullable: true })
  private waterArea?: number;

  @Property({
    fieldName: 'land_sqmi',
    columnType: 'decimal(10, 2)',
    nullable: true,
  })
  private landSqmi?: number;

  @Property({
    fieldName: 'water_sqmi',
    columnType: 'decimal(10, 2)',
    nullable: true,
  })
  private waterSqmi?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private latitude?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  private longitude?: number;

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getStateId(): string {
    return this.stateId;
  }

  public getLandArea(): number | undefined {
    return this.landArea;
  }

  public getWaterArea(): number | undefined {
    return this.waterArea;
  }

  public getLandSqmi(): number | undefined {
    return this.landSqmi;
  }

  public getWaterSqmi(): number | undefined {
    return this.waterSqmi;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }
}
