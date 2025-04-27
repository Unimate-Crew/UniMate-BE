import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { UserRepository } from './user.repository';

export enum OAuthProvider {
  NAVER = 'NAVER',
  KAKAO = 'KAKAO',
}

@Entity({ repository: () => UserRepository })
export class User {
  @PrimaryKey()
  private readonly id!: number;

  @Property({ nullable: true })
  private email?: string;

  @Property({ nullable: true })
  private name?: string;

  @Property()
  private nickname!: string;

  @Property({ nullable: true })
  private profileImageUrl?: string;

  @Property({ nullable: true })
  private phoneNumber?: string;

  @Enum(() => OAuthProvider)
  private provider!: OAuthProvider;

  @Property({ nullable: true })
  private providerId?: string;

  @Property({ nullable: true })
  private refreshToken?: string;

  @Property()
  private createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  private updatedAt: Date = new Date();

  @Property({ default: false })
  private isSignUpCompleted: boolean = false;

  public getId(): number {
    return this.id;
  }

  public getEmail(): string | undefined {
    return this.email;
  }

  public getName(): string {
    return this.name;
  }

  public getNickname(): string {
    return this.nickname;
  }

  public getProfileImageUrl(): string | undefined {
    return this.profileImageUrl;
  }

  public getProvider(): OAuthProvider {
    return this.provider;
  }

  public getProviderId(): string {
    return this.providerId;
  }

  public getPhoneNumber(): string | undefined {
    return this.phoneNumber;
  }

  public getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  public changeRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }

  public getIsSignUpCompleted(): boolean {
    return this.isSignUpCompleted;
  }

  public completeSignUp(): void {
    this.isSignUpCompleted = true;
  }
}
