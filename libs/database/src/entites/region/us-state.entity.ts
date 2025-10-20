import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsStateRepository } from './us-state.repository';

@Entity({ repository: () => UsStateRepository, tableName: 'us_state' })
export class UsState {
  @PrimaryKey()
  id!: number;

  @Property()
  geoid?: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  stusab?: string;

  @Property({ fieldName: 'land_area', columnType: 'bigint', nullable: true })
  landArea?: number;

  @Property({ fieldName: 'water_area', columnType: 'bigint', nullable: true })
  waterArea?: number;

  @Property({
    fieldName: 'land_sqmi',
    columnType: 'decimal(10, 2)',
    nullable: true,
  })
  landSqmi?: number;

  @Property({
    fieldName: 'water_sqmi',
    columnType: 'decimal(10, 2)',
    nullable: true,
  })
  waterSqmi?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  latitude?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  longitude?: number;

  public getId(): number {
    return this.id;
  }

  public getGeoid(): string {
    return this.geoid;
  }

  public setGeoid(geoid: string): void {
    this.geoid = geoid;
  }

  public getName(): string {
    return this.name;
  }

  public getStusab(): string | undefined {
    return this.stusab;
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
