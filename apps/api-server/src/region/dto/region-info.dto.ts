import { ApiProperty } from '@nestjs/swagger';
import { Region } from '@app/database/entites/region/region.entity';
import { CountryCode } from '@app/database/common/enums';

export class RegionInfo {
  @ApiProperty({ description: '지역 ID' })
  id: number;

  @ApiProperty({ description: '지역 이름' })
  name: string;

  @ApiProperty({ description: '국가 코드', required: false, enum: CountryCode })
  countryCode?: CountryCode;

  @ApiProperty({
    description: '1차 행정구역 코드',
    required: false,
    example: 'AL',
  })
  admin1Code?: string;

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
    dto.countryCode = entity.getCountryCode();
    dto.admin1Code = entity.getAdmin1Code();
    dto.latitude = entity.getLatitude();
    dto.longitude = entity.getLongitude();
    return dto;
  }
}
