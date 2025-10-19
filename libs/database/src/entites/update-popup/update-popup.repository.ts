import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { PlatformType } from '../../common/enums';
import { UpdatePopup } from './update-popup.entity';

@Injectable()
export class UpdatePopupRepository extends EntityRepository<UpdatePopup> {
  /**
   * 플랫폼별 모든 활성화된 업데이트 팝업 정책을 조회합니다.
   * FORCE, RECOMMEND 타입 모두 조회합니다.
   * @param platform 플랫폼 타입 (IOS, ANDROID)
   * @returns 활성화된 업데이트 팝업 정보 배열
   */
  async findAllActiveByPlatform(
    platform: PlatformType,
  ): Promise<UpdatePopup[]> {
    return this.find({
      platform,
      isActive: true,
      isDeleted: false,
    });
  }
}
