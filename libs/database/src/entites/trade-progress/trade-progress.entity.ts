import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { TradeProgressRepository } from './trade-progress.repository';
import { TradeProgressStatus } from '../../common/enums';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => TradeProgressRepository })
export class TradeProgress extends BaseEntity {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property()
  productPostId!: number;

  @Property()
  buyerId!: number;

  @Enum(() => TradeProgressStatus)
  status!: TradeProgressStatus;

  public getId(): number {
    return this.id;
  }

  public getProductPostId(): number {
    return this.productPostId;
  }

  public setProductPostId(productPostId: number): void {
    this.productPostId = productPostId;
  }

  public getBuyerId(): number {
    return this.buyerId;
  }

  public setBuyerId(buyerId: number): void {
    this.buyerId = buyerId;
  }

  public getStatus(): TradeProgressStatus {
    return this.status;
  }

  public setStatus(status: TradeProgressStatus): void {
    this.status = status;
  }

  public isReserved(): boolean {
    return this.status === TradeProgressStatus.RESERVED;
  }

  public isCompleted(): boolean {
    return this.status === TradeProgressStatus.COMPLETED;
  }

  public isTradeProgressDeleted(): boolean {
    return this.isDeleted;
  }
}