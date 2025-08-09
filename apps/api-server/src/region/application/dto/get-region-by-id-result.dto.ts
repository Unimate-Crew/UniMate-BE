import { Region } from '@app/database/entites/region/region.entity';
import { RegionInfo } from '../../api/dto/region-info.dto';

export class GetRegionByIdResultDto extends RegionInfo {
  static from(region: Region): GetRegionByIdResultDto {
    return RegionInfo.from(region) as GetRegionByIdResultDto;
  }
}
