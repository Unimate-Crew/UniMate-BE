import { ApiProperty } from '@nestjs/swagger';
import { PagedResult } from '@app/common';
import { Region } from '@app/database/entites/region/region.entity';
import { RegionInfo } from './region-info.dto';

export class RegionListResponse {
  @ApiProperty({ description: '지역 정보 목록', type: [RegionInfo] })
  contents: RegionInfo[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  /**
   * PagedResult<Region>에서 RegionListResponse DTO 객체를 생성합니다.
   * @param pagedResult Region 페이징 결과
   * @returns RegionListResponse DTO 객체
   */
  static fromPagedResult(pagedResult: PagedResult<Region>): RegionListResponse {
    const response = new RegionListResponse();
    response.contents = pagedResult.items.map((region) =>
      RegionInfo.from(region),
    );
    response.hasNext = pagedResult.hasNext;
    return response;
  }
}

export { RegionInfo };
