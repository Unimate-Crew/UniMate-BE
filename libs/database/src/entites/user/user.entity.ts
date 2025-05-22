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
  private readonly id!: number;

  @Property()
  private name!: string;

  @Property({ unique: true })
  private nickname!: string;

  @Property({ nullable: true })
  private profileImageUrl?: string;

  @Property({ nullable: true })
  private phoneNumber?: string;

  @Enum(() => OAuthProvider)
  private provider!: OAuthProvider;

  @Property({ nullable: true })
  private refreshToken?: string;

  @Property({ nullable: true })
  private universityId?: number;

  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public setNickname(nickname: string): void {
    this.nickname = nickname;
  }

  public getProfileImageUrl(): string | undefined {
    return this.profileImageUrl;
  }

  public setProfileImageUrl(profileImageUrl: string): void {
    this.profileImageUrl = profileImageUrl;
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

  public isUserDeleted(): boolean {
    return this.isDeleted;
  }
}
