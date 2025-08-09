export class SaveInterestRegionsParamsDto {
  userId: number;

  regionIds: string[];

  primaryRegionId?: string;

  static of(
    userId: number,
    regionIds: string[],
    primaryRegionId?: string,
  ): SaveInterestRegionsParamsDto {
    const params = new SaveInterestRegionsParamsDto();
    params.userId = userId;
    params.regionIds = regionIds;
    params.primaryRegionId = primaryRegionId;
    return params;
  }
}
