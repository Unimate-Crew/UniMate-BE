import { PagedResult } from '@app/common';
import { Region } from '@app/database/entites/region/region.entity';
import { RegionInfo } from '../../api/dto/region-info.dto';

export class SearchRegionsResultDto {
  contents: RegionInfo[];

  hasNext: boolean;

  static fromPagedResult(
    pagedResult: PagedResult<Region>,
  ): SearchRegionsResultDto {
    const result = new SearchRegionsResultDto();
    result.contents = pagedResult.contents.map((region) =>
      RegionInfo.from(region),
    );
    result.hasNext = pagedResult.hasNext;
    return result;
  }
}
