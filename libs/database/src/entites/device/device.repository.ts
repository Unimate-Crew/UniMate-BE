import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { Device } from './device.entity';

@Injectable()
export class DeviceRepository extends EntityRepository<Device> {
  /**
   * 특정 유저의 모든 디바이스 조회 (삭제되지 않은 것만)
   */
  async findByUserId(userId: number): Promise<Device[]> {
    return this.find({
      userId,
      isDeleted: false,
    });
  }

  /**
   * 여러 유저의 디바이스 일괄 조회
   */
  async findByUserIds(userIds: number[]): Promise<Device[]> {
    if (userIds.length === 0) {
      return [];
    }

    return this.find({
      userId: { $in: userIds },
      isDeleted: false,
    });
  }

  /**
   * 디바이스 토큰으로 디바이스 조회
   */
  async findByDeviceToken(deviceToken: string): Promise<Device | null> {
    return this.findOne({
      deviceToken,
      isDeleted: false,
    });
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(device: Device): Promise<void> {
    await this.em.persistAndFlush(device);
  }

  /**
   * 특정 사용자의 모든 디바이스를 소프트 딜리트 처리합니다.
   * @param userId 사용자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByUserId(userId: number): Promise<number> {
    return this.nativeUpdate(
      { userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}
