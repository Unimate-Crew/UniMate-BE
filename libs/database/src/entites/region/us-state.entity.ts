import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UsStateRepository } from './us-state.repository';

@Entity({ repository: () => UsStateRepository, tableName: 'us_state' })
export class UsState {
  @PrimaryKey()
  private readonly id!: string;

  @Property()
  private name!: string;

  @Property({ nullable: true })
  private stusab?: string;

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
