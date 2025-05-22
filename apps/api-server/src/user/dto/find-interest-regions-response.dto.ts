// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({
    description: '지역 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '지역명',
    example: '서울',
  })
  name: string;

  @ApiProperty({
    description: '기본 관심지역 여부',
    example: true,
    default: false,
  })
  isPrimary: boolean;
}

export class FindInterestRegionsResponseDto {
  @ApiProperty({
    description: '사용자의 관심지역 목록',
    type: [RegionDto],
  })
  regions: RegionDto[];

  static of(regions: RegionDto[]): FindInterestRegionsResponseDto {
    const response = new FindInterestRegionsResponseDto();
    response.regions = regions;
    return response;
  }
}
