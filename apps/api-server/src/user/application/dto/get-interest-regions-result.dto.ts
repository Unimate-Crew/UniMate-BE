import { InterestRegionInfosDto } from '../../api/dto/inrerest-resion-info.dto';

export class GetInterestRegionsResultDto extends InterestRegionInfosDto {
  static of(
    interestRegions: InterestRegionInfosDto,
  ): GetInterestRegionsResultDto {
    return interestRegions as GetInterestRegionsResultDto;
  }
}
