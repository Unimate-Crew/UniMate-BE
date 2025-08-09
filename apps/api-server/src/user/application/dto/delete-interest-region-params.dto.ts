export class DeleteInterestRegionParamsDto {
  userId: number;

  regionId: string;

  static of(userId: number, regionId: string): DeleteInterestRegionParamsDto {
    const params = new DeleteInterestRegionParamsDto();
    params.userId = userId;
    params.regionId = regionId;
    return params;
  }
}
