import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { UserRepository } from './user.repository';
import { BaseEntity } from '../../common/base.entity';

export enum OAuthProvider {
  NAVER = 'NAVER',
  KAKAO = 'KAKAO',
  APPLE = 'APPLE',
}

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  nickname!: string;

  @Property({ nullable: true })
  profileImageKey?: string;

  @Property({ nullable: true })
  phoneNumber?: string;

  @Enum(() => OAuthProvider)
  provider!: OAuthProvider;

  @Property({ nullable: true })
  providerId?: string;

  @Property({ nullable: true })
  refreshToken?: string;

  @Property({ nullable: true })
  universityId?: number;

  @Property({ nullable: true })
  universityEmail?: string;

  @Property({ default: true })
  priceChangedNotificationEnabled: boolean = true;

  @Property({ default: true })
  saleEndedNotificationEnabled: boolean = true;

  public getId(): number {
    return this.id;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public setNickname(nickname: string): void {
    this.nickname = nickname;
  }

  public getProfileImageKey(): string | undefined {
    return this.profileImageKey;
  }

  public setProfileImageKey(profileImageKey: string): void {
    this.profileImageKey = profileImageKey;
  }

  public getProvider(): OAuthProvider {
    return this.provider;
  }

  public getPhoneNumber(): string | undefined {
    return this.phoneNumber;
  }

  public setPhoneNumber(phoneNumber: string): void {
    this.phoneNumber = phoneNumber;
  }

  public getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  public changeRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  public getUniversityId(): number | undefined {
    return this.universityId;
  }

  public setUniversityId(universityId: number): void {
    this.universityId = universityId;
  }

  public getUniversityEmail(): string | undefined {
    return this.universityEmail;
  }

  public setUniversityEmail(universityEmail: string): void {
    this.universityEmail = universityEmail;
  }

  public isUserDeleted(): boolean {
    return this.isDeleted;
  }

  public isPriceChangedNotificationEnabled(): boolean {
    return this.priceChangedNotificationEnabled;
  }

  public setPriceChangedNotificationEnabled(enabled: boolean): void {
    this.priceChangedNotificationEnabled = enabled;
  }

  public isSaleEndedNotificationEnabled(): boolean {
    return this.saleEndedNotificationEnabled;
  }

  public setSaleEndedNotificationEnabled(enabled: boolean): void {
    this.saleEndedNotificationEnabled = enabled;
  }

  public updateNotificationSettings(settings: {
    priceChangedNotificationEnabled?: boolean;
    saleEndedNotificationEnabled?: boolean;
  }): void {
    if (settings.priceChangedNotificationEnabled !== undefined) {
      this.priceChangedNotificationEnabled =
        settings.priceChangedNotificationEnabled;
    }
    if (settings.saleEndedNotificationEnabled !== undefined) {
      this.saleEndedNotificationEnabled = settings.saleEndedNotificationEnabled;
    }
  }
}
