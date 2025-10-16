import { ApiProperty } from '@nestjs/swagger';

export class UniversityItemDto {
  @ApiProperty({
    description: '대학교 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '대학교 이름',
    example: 'Harvard University',
  })
  name: string;

  @ApiProperty({
    description: '국가',
    example: 'USA',
  })
  country: string;

  constructor(id: number, name: string, country: string) {
    this.id = id;
    this.name = name;
    this.country = country;
  }
}
