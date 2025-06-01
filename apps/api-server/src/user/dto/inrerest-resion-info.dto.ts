// eslint-disable-next-line max-classes-per-file
import { InterestRegionWithRegion } from '@app/database/entites/interest-region/dto/interest-region-wiht-region';
import { ApiProperty } from '@nestjs/swagger';

export class InterestRegionInfoDto {
  @ApiProperty({
    description: '지역 ID',
    example: 1,
  })
  regionId: string;

  @ApiProperty({
    description: '지역명',
    example: 'New York City',
  })
  regionName: string;

  @ApiProperty({
    description: '기본 관심지역 여부',
    example: true,
    default: false,
  })
  isPrimary: boolean;

  constructor(regionId: string, regionName: string, isPrimary: boolean) {
    this.regionId = regionId;
    this.regionName = regionName;
    this.isPrimary = isPrimary;
  }
}

export class InterestRegionInfosDto {
  @ApiProperty({
    description: '사용자의 관심지역 목록',
    type: [InterestRegionInfoDto],
  })
  interestRegions: InterestRegionInfoDto[];

  constructor(interestRegions: InterestRegionInfoDto[]) {
    this.interestRegions = interestRegions;
  }

  static of(
    interestRegionWithRegions: InterestRegionWithRegion[],
  ): InterestRegionInfosDto {
    const interestRegionInfos: InterestRegionInfoDto[] =
      interestRegionWithRegions.map((interestRegionWithRegion) => {
        return new InterestRegionInfoDto(
          interestRegionWithRegion.getRegion().getId(),
          interestRegionWithRegion.getRegion().getName(),
          interestRegionWithRegion.getInterestRegion().getIsPrimary(),
        );
      });

    return new InterestRegionInfosDto(interestRegionInfos);
  }
}
