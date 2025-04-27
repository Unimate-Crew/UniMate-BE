import { ApiProperty } from '@nestjs/swagger';
import { PagedResult } from '@app/common';
import { UsCity } from 'libs/database/src/entites/city/us-city.entity';
import { CityInfo } from './city-info.dto';

export class CityListResponse {
  @ApiProperty({ description: '도시 정보 목록', type: [CityInfo] })
  content: CityInfo[];

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  /**
   * PagedResult<UsCity>에서 CityListResponse DTO 객체를 생성합니다.
   * @param pagedResult UsCity 페이징 결과
   * @returns CityListResponse DTO 객체
   */
  static fromPagedResult(pagedResult: PagedResult<UsCity>): CityListResponse {
    const response = new CityListResponse();
    response.content = pagedResult.content.map((city) => CityInfo.from(city));
    response.hasNext = pagedResult.hasNext;
    return response;
  }
}

export { CityInfo };
