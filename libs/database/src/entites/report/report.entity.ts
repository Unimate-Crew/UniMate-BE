import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ReportRepository } from './report.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => ReportRepository })
export class Report extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  targetUserId!: number;

  @Property()
  userId!: number;

  @Property()
  reason!: string;

  @Property({ nullable: true })
  detail?: string;

  public getId(): number {
    return this.id;
  }

  public getTargetUserId(): number {
    return this.targetUserId;
  }

  public setTargetUserId(targetUserId: number): void {
    this.targetUserId = targetUserId;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public getReason(): string {
    return this.reason;
  }

  public setReason(reason: string): void {
    this.reason = reason;
  }

  public getDetail(): string | undefined {
    return this.detail;
  }

  public setDetail(detail: string): void {
    this.detail = detail;
  }

  public isReportDeleted(): boolean {
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
