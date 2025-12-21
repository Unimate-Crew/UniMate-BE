import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
// eslint-disable-next-line import/no-cycle
import { ProductPostRepository } from './product-post.repository';
import {
  CurrencyType,
  TradeStatus,
  ProductCategory,
  TradeType,
} from '../../common/enums';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => ProductPostRepository })
export class ProductPost extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  userId!: number;

  @Property()
  price!: number;

  @Enum(() => CurrencyType)
  currencyType!: CurrencyType;

  @Enum(() => ProductCategory)
  category!: ProductCategory;

  @Enum(() => TradeStatus)
  tradeStatus!: TradeStatus;

  @Enum(() => TradeType)
  tradeType?: TradeType;

  @Property({ nullable: true })
  tradeTypeDescription?: string;

  @Property()
  regionId!: number;

  @Property({ default: false })
  isHidden!: boolean;

  public isOwner(userId: number): boolean {
    return this.userId === userId;
  }

  public getId(): number {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public getPrice(): number {
    return this.price;
  }

  public setPrice(price: number): void {
    this.price = price;
  }

  public getCurrencyType(): CurrencyType {
    return this.currencyType;
  }

  public setCurrencyType(currencyType: CurrencyType): void {
    this.currencyType = currencyType;
  }

  public getCategory(): ProductCategory {
    return this.category;
  }

  public setCategory(category: ProductCategory): void {
    this.category = category;
  }

  public getTradeStatus(): TradeStatus {
    return this.tradeStatus;
  }

  public setTradeStatus(tradeStatus: TradeStatus): void {
    this.tradeStatus = tradeStatus;
  }

  public getTradeType(): TradeType | undefined {
    return this.tradeType;
  }

  public setTradeType(tradeType: TradeType): void {
    this.tradeType = tradeType;
  }

  public getTradeTypeDescription(): string | undefined {
    return this.tradeTypeDescription;
  }

  public setTradeTypeDescription(tradeTypeDescription: string): void {
    this.tradeTypeDescription = tradeTypeDescription;
  }

  public getRegionId(): number {
    return this.regionId;
  }

  public setRegionId(regionId: number): void {
    this.regionId = regionId;
  }

  public isProductPostDeleted(): boolean {
    return this.isDeleted;
  }

  public getIsHidden(): boolean {
    return this.isHidden;
  }

  public setIsHidden(isHidden: boolean): void {
    this.isHidden = isHidden;
  }

  public isReserved(): boolean {
    return this.tradeStatus === TradeStatus.RESERVED;
  }

  public isCompleted(): boolean {
    return this.tradeStatus === TradeStatus.COMPLETED;
  }
}
