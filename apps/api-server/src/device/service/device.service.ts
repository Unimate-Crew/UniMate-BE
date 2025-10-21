import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from '@app/database/entites/device/device.repository';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { Device } from '@app/database';
import { PlatformType } from '@app/database/common/enums';
import { ErrorCode } from '@app/common';
import { RegisterDeviceResultDto } from './dto/register-device-result.dto';

@Injectable()
export class DeviceService {
  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * 디바이스 토큰 등록
   * - 동일한 디바이스 토큰이 다른 유저에게 등록되어 있으면 기존 토큰 삭제 후 새로 생성
   * - 동일한 유저의 토큰이면 기존 디바이스 반환
   * - 존재하지 않으면 새로 생성
   */
  async registerDevice(params: {
    userId: number;
    deviceToken: string;
    platform: PlatformType;
  }): Promise<RegisterDeviceResultDto> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({ id: params.userId });

    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: '유저가 존재하지 않습니다.',
      });
    }

    // 기존 디바이스 토큰 확인
    const existingDevice = await this.deviceRepository.findByDeviceToken(
      params.deviceToken,
    );

    // 같은 유저의 기존 토큰이면 DB 작업 없이 바로 반환
    if (existingDevice && existingDevice.getUserId() === params.userId) {
      return RegisterDeviceResultDto.fromEntity(existingDevice);
    }

    // 다른 유저의 토큰이면 삭제 처리
    if (existingDevice) {
      existingDevice.delete();
    }

    // 새 디바이스 생성
    const device = this.deviceRepository.create({
      userId: params.userId,
      deviceToken: params.deviceToken,
      platform: params.platform,
    });

    await this.deviceRepository.flush();
    return RegisterDeviceResultDto.fromEntity(device);
  }
}
