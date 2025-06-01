// eslint-disable-next-line max-classes-per-file
import { InterestRegion } from '@app/database';
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

  static of(interestRegions: InterestRegion[]): InterestRegionInfosDto {
    const interestRegionInfos: InterestRegionInfoDto[] = interestRegions.map(
      (interestRegion) => {
        return new InterestRegionInfoDto(
          interestRegion.getRegion().getId(),
          interestRegion.getRegion().getName(),
          interestRegion.getIsPrimary(),
        );
      },
    );

    return new InterestRegionInfosDto(interestRegionInfos);
  }
}
