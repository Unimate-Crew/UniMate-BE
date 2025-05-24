import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@app/database/entites/region/region.entity';

export class RegionInfo {
  @ApiProperty({ description: '지역 ID' })
  id: string;

  @ApiProperty({ description: '지역 이름' })
  name: string;

  @ApiProperty({ description: '위도', required: false })
  latitude?: number;

  @ApiProperty({ description: '경도', required: false })
  longitude?: number;

  /**
   * Region 엔티티에서 RegionInfo DTO 객체를 생성합니다.
   * @param entity Region 엔티티
   * @returns RegionInfo DTO 객체
   */
  static from(entity: Region): RegionInfo {
    const dto = new RegionInfo();
    dto.id = entity.getId();
    dto.name = entity.getName();
    dto.latitude = entity.getLatitude();
    dto.longitude = entity.getLongitude();
    return dto;
  }
}
