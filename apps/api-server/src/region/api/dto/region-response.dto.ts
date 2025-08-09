import { ApiProperty } from '@nestjs/swagger';
import { PagedResult } from '@app/common';
import { Region } from '@app/database/entites/region/region.entity';
import { RegionInfo } from './region-info.dto';

export class SearchRegionsResponseDto {
  @ApiProperty({ description: '지역 정보 목록', type: [RegionInfo] })
  contents: RegionInfo[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  /**
   * SearchRegionsResultDto에서 SearchRegionsResponseDto DTO 객체를 생성합니다.
   * @param result SearchRegionsResultDto 결과
   * @returns SearchRegionsResponseDto DTO 객체
   */
  static fromResult(result: any): SearchRegionsResponseDto {
    const response = new SearchRegionsResponseDto();
    response.contents = result.contents;
    response.hasNext = result.hasNext;
    return response;
  }
}

export { RegionInfo };
