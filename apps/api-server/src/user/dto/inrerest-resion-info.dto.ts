// eslint-disable-next-line max-classes-per-file
import { InterestRegion } from '@app/database';
import { ApiProperty } from '@nestjs/swagger';

export class InterestRegionInfoDto {
  @ApiProperty({
    description: '지역 ID',
    example: 1,
  })
  regionId: number;

  @ApiProperty({
    description: '지역명',
    example: 'New York City',
  })
  regionName: string;

  @ApiProperty({
    description: '1차 행정구역 코드',
    required: false,
    example: 'AL',
  })
  admin1Code?: string;

  @ApiProperty({
    description: '기본 관심지역 여부',
    example: true,
    default: false,
  })
  isPrimary: boolean;

  constructor(
    regionId: number,
    regionName: string,
    isPrimary: boolean,
    admin1Code?: string,
  ) {
    this.regionId = regionId;
    this.regionName = regionName;
    this.isPrimary = isPrimary;
    this.admin1Code = admin1Code;
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
          interestRegion.getRegion().getAdmin1Code(),
        );
      },
    );

    return new InterestRegionInfosDto(interestRegionInfos);
  }
}
