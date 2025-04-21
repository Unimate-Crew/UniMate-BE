// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class CityDto {
  @ApiProperty({
    description: '도시 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '도시명',
    example: '서울',
  })
  name: string;
}

export class FindInterestCitiesResponseDto {
  @ApiProperty({
    description: '사용자의 관심도시 목록',
    type: [CityDto],
  })
  cities: CityDto[];

  static of(cities: CityDto[]): FindInterestCitiesResponseDto {
    const response = new FindInterestCitiesResponseDto();
    response.cities = cities;
    return response;
  }
}
