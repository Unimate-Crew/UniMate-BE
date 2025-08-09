export class SetPrimaryInterestRegionParamsDto {
  userId: number;

  regionId: string;

  static of(
    userId: number,
    regionId: string,
  ): SetPrimaryInterestRegionParamsDto {
    const params = new SetPrimaryInterestRegionParamsDto();
    params.userId = userId;
    params.regionId = regionId;
    return params;
  }
}
