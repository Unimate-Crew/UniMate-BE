import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UniversityRepository } from './university.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => UniversityRepository })
export class University extends BaseEntity {
  @PrimaryKey()
  private readonly id!: number;

  @Property()
  private name!: string;

  @Property()
  private domain!: string;

  @Property()
  private country!: string;

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getDomain(): string {
    return this.domain;
  }

  public setDomain(domain: string): void {
    this.domain = domain;
  }

  public getCountry(): string {
    return this.country;
  }

  public setCountry(country: string): void {
    this.country = country;
  }

  public isUniversityDeleted(): boolean {
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
