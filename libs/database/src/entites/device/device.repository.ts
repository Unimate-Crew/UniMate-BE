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
}
