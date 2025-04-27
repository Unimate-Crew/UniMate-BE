import { ApiProperty } from '@nestjs/swagger';
import { UsCity } from 'libs/database/src/entites/city/us-city.entity';

export class CityInfo {
  @ApiProperty({ description: '도시 ID' })
  id: string;

  @ApiProperty({ description: '도시 이름' })
  name: string;

  @ApiProperty({ description: '위도', required: false })
  latitude?: number;

  @ApiProperty({ description: '경도', required: false })
  longitude?: number;

  /**
   * UsCity 엔티티에서 CityInfo DTO 객체를 생성합니다.
   * @param entity UsCity 엔티티
   * @returns CityInfo DTO 객체
   */
  static from(entity: UsCity): CityInfo {
    const dto = new CityInfo();
    dto.id = entity.getId();
    dto.name = entity.getName();
    dto.latitude = entity.getLatitude();
    dto.longitude = entity.getLongitude();
    return dto;
  }
}
