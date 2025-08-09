export class SaveInterestRegionParamsDto {
  userId: number;

  regionId: string;

  static of(userId: number, regionId: string): SaveInterestRegionParamsDto {
    const params = new SaveInterestRegionParamsDto();
    params.userId = userId;
    params.regionId = regionId;
    return params;
  }
}
