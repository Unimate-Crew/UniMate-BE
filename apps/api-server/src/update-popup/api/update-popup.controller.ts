import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdatePopupService } from '../application/update-popup.service';
import { CheckUpdatePopupRequestDto } from './dto/check-update-popup.request.dto';
import { CheckUpdatePopupResponseDto } from './dto/check-update-popup.response.dto';
import { UpdatePopupCheckResultDto } from '../application/dto/update-popup-check-result.dto';
import { ErrorResponse } from '../../common/error-response';

@ApiTags('업데이트 팝업')
@Controller({ path: 'update-popup' })
export class UpdatePopupController {
  constructor(private readonly updatePopupService: UpdatePopupService) {}

  @Get('/check')
  @ApiOperation({
    summary: '앱 버전 확인 API',
    description:
      '클라이언트의 현재 버전과 플랫폼 정보를 받아 강제/권장 업데이트 여부와 팝업 정보를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '앱 버전 확인 성공',
    type: CheckUpdatePopupResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async checkUpdatePopup(
    @Query() query: CheckUpdatePopupRequestDto,
  ): Promise<CheckUpdatePopupResponseDto> {
    const result: UpdatePopupCheckResultDto =
      await this.updatePopupService.checkUpdatePopup({
        platform: query.platform,
        version: query.version,
      });

    return CheckUpdatePopupResponseDto.of(result);
  }
}
