import { ApiProperty } from '@nestjs/swagger';
import { UsCity } from 'libs/database/src/entites/city/us-city.entity';

export class CityInfo {
  @ApiProperty({ description: '도시 GEOID' })
  geoid: string;

  @ApiProperty({ description: '도시 이름' })
  name: string;

  @ApiProperty({ description: '위도', required: false })
  latitude?: number;

  @ApiProperty({ description: '경도', required: false })
  longitude?: number;

  @ApiProperty({ description: '인구', required: false })
  population?: number;

  @ApiProperty({ description: '주 FIPS 코드', required: false })
  state_fips?: string;

  /**
   * UsCity 엔티티에서 CityInfo DTO 객체를 생성합니다.
   * @param entity UsCity 엔티티
   * @returns CityInfo DTO 객체
   */
  static from(entity: UsCity): CityInfo {
    const dto = new CityInfo();
    dto.geoid = entity.getGeoid();
    dto.name = entity.getName();
    dto.latitude = entity.getLatitude();
    dto.longitude = entity.getLongitude();
    dto.population = entity.getPopulation();
    dto.state_fips = entity.getStateFips();
    return dto;
  }
}
