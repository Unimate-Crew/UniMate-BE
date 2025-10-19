import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from '../../common/base.entity';
import { PlatformType, UpdateType } from '../../common/enums';
import { UpdatePopupRepository } from './update-popup.repository';

@Entity({ repository: () => UpdatePopupRepository })
export class UpdatePopup extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Enum(() => PlatformType)
  platform!: PlatformType;

  @Enum(() => UpdateType)
  updateType!: UpdateType;

  @Property()
  version!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ default: true })
  isActive: boolean = true;

  public getId(): number {
    return this.id;
  }

  public getPlatform(): PlatformType {
    return this.platform;
  }

  public setPlatform(platform: PlatformType): void {
    this.platform = platform;
  }

  public getUpdateType(): UpdateType {
    return this.updateType;
  }

  public setUpdateType(updateType: UpdateType): void {
    this.updateType = updateType;
  }

  public getVersion(): string {
    return this.version;
  }

  public setVersion(version: string): void {
    this.version = version;
  }

  public getTitle(): string {
    return this.title;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public getContent(): string {
    return this.content;
  }

  public setContent(content: string): void {
    this.content = content;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public setIsActive(isActive: boolean): void {
    this.isActive = isActive;
  }

  /**
   * 현재 버전에 대해 이 팝업을 표시해야 하는지 확인합니다.
   * @param currentVersion 현재 앱 버전 (semver 형식: x.y.z)
   * @returns 팝업 표시 여부
   */
  public shouldShowForVersion(currentVersion: string): boolean {
    // FORCE든 RECOMMEND든 동일: 현재 버전 < version
    return this.compareVersions(currentVersion, this.version) < 0;
  }

  /**
   * 두 버전을 비교합니다 (semver 형식).
   * @param version1 비교할 버전 1
   * @param version2 비교할 버전 2
   * @returns version1 < version2이면 음수, version1 > version2이면 양수, 같으면 0
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map((part) => parseInt(part, 10));
    const v2Parts = version2.split('.').map((part) => parseInt(part, 10));

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) {
        return -1;
      }
      if (v1Part > v2Part) {
        return 1;
      }
    }

    return 0;
  }
}
