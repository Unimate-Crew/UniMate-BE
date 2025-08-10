import { ApiProperty } from '@nestjs/swagger';

export class UniversityInfoDto {
  @ApiProperty({
    description: '대학교 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '대학교 이름',
    example: '서울대학교',
  })
  name: string;

  @ApiProperty({
    description: '대학교 도메인',
    example: 'snu.ac.kr',
  })
  domain: string;

  @ApiProperty({
    description: '대학교가 위치한 나라',
    example: '대한민국',
  })
  country: string;

  static of(
    id: number,
    name: string,
    domain: string,
    country: string,
  ): UniversityInfoDto {
    const dto = new UniversityInfoDto();
    dto.id = id;
    dto.name = name;
    dto.domain = domain;
    dto.country = country;
    return dto;
  }
}
