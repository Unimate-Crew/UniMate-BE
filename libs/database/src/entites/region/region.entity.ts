import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { CountryCode } from '@app/database/common/enums';
import { RegionRepository } from './region.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => RegionRepository })
export class Region extends BaseEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Enum(() => CountryCode)
  countryCode?: CountryCode; // ISO 3166-1 alpha-2 코드 (국가 코드 ex. KR, US)

  @Property({ fieldName: 'admin1_code' })
  admin1Code?: string; // 1차 행정구역 코드

  @Property()
  stateId!: string;

  @Property()
  countyId?: string;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  latitude?: number;

  @Property({ columnType: 'decimal(10, 6)', nullable: true })
  longitude?: number;

  @Property({ columnType: 'bigint', nullable: true })
  population?: number;

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getCountryCode(): CountryCode | undefined {
    return this.countryCode;
  }

  public setCountryCode(countryCode: CountryCode): void {
    this.countryCode = countryCode;
  }

  public getAdmin1Code(): string | undefined {
    return this.admin1Code;
  }

  public setAdmin1Code(admin1Code: string): void {
    this.admin1Code = admin1Code;
  }

  public getStateId(): string {
    return this.stateId;
  }

  public setStateId(stateId: string): void {
    this.stateId = stateId;
  }

  public getCountyId(): string | undefined {
    return this.countyId;
  }

  public setCountyId(countyId: string): void {
    this.countyId = countyId;
  }

  public getLatitude(): number | undefined {
    return this.latitude;
  }

  public setLatitude(latitude: number): void {
    this.latitude = latitude;
  }

  public getLongitude(): number | undefined {
    return this.longitude;
  }

  public setLongitude(longitude: number): void {
    this.longitude = longitude;
  }

  public getPopulation(): number | undefined {
    return this.population;
  }

  public setPopulation(population: number): void {
    this.population = population;
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
