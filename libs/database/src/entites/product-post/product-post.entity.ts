import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
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
  private readonly id!: number;

  @Property()
  private title!: string;

  @Property({ nullable: true })
  private description?: string;

  @Property()
  private userId!: number;

  @Property()
  private price!: number;

  @Enum(() => CurrencyType)
  private currencyType!: CurrencyType;

  @Enum(() => ProductCategory)
  private category!: ProductCategory;

  @Enum(() => TradeStatus)
  private tradeStatus!: TradeStatus;

  @Enum(() => TradeType)
  private tradeType?: TradeType;

  @Property({ nullable: true })
  private tradeTypeDescription?: string;

  @Property()
  private regionId!: number;

  @Property({ nullable: true })
  private universityId?: number;

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

  public getUniversityId(): number | undefined {
    return this.universityId;
  }

  public setUniversityId(universityId: number): void {
    this.universityId = universityId;
  }
}
