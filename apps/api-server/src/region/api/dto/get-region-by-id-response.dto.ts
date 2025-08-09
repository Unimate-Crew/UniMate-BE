import { ApiProperty } from '@nestjs/swagger';
import { RegionInfo } from './region-info.dto';

export class GetRegionByIdResponseDto {
  @ApiProperty({ description: '지역 상세 정보', type: RegionInfo })
  static from(regionInfo: RegionInfo): GetRegionByIdResponseDto {
    return regionInfo;
  }
}
