import { Injectable } from '@nestjs/common';
import { UpdatePopupRepository } from '@app/database/entites/update-popup/update-popup.repository';
import { UpdatePopup } from '@app/database/entites/update-popup/update-popup.entity';
import { PlatformType, UpdateType } from '@app/database/common/enums';
import { UpdatePopupCheckResultDto } from './dto/update-popup-check-result.dto';

@Injectable()
export class UpdatePopupService {
  constructor(private readonly updatePopupRepository: UpdatePopupRepository) {}

  /**
   * 앱 버전을 확인하여 업데이트 팝업 노출 여부를 판단합니다.
   *
   * @param params.platform 플랫폼 타입 (IOS, ANDROID)
   * @param params.version 현재 앱 버전 (semver 형식: x.y.z)
   * @returns 업데이트 팝업 정보 (강제 업데이트 여부, 팝업 노출 여부, 제목, 내용)
   */
  async checkUpdatePopup(params: {
    platform: PlatformType;
    version: string;
  }): Promise<UpdatePopupCheckResultDto> {
    // 1. 플랫폼별 모든 활성화된 업데이트 팝업 정책 조회
    const updatePopups: UpdatePopup[] =
      await this.updatePopupRepository.findAllActiveByPlatform(params.platform);

    // 2. 정책이 없는 경우 팝업 미노출
    if (updatePopups.length === 0) {
      return new UpdatePopupCheckResultDto(false, false, '', '');
    }

    // 3. FORCE 타입 레코드 확인
    const forcePopup: UpdatePopup = updatePopups.find(
      (popup) => popup.getUpdateType() === UpdateType.FORCE,
    );

    if (forcePopup && forcePopup.shouldShowForVersion(params.version)) {
      return new UpdatePopupCheckResultDto(
        true,
        true,
        forcePopup.getTitle(),
        forcePopup.getContent(),
      );
    }

    // 4. RECOMMEND 타입 레코드 확인
    const recommendPopup: UpdatePopup = updatePopups.find(
      (popup) => popup.getUpdateType() === UpdateType.RECOMMEND,
    );

    if (recommendPopup && recommendPopup.shouldShowForVersion(params.version)) {
      return new UpdatePopupCheckResultDto(
        false,
        true,
        recommendPopup.getTitle(),
        recommendPopup.getContent(),
      );
    }

    // 5. 업데이트 불필요
    return new UpdatePopupCheckResultDto(false, false, '', '');
  }
}
