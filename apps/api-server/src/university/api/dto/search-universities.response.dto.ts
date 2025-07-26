// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../../common/enums';
import { UniversityResultDto } from '../../application/dto/university.result.dto';

export class UniversityDto {
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
    enum: Country,
    example: Country.USA,
  })
  country: Country;
}

export class SearchUniversitiesResponseDto {
  @ApiProperty({
    description: '대학교 목록',
    type: [UniversityDto],
  })
  content: UniversityDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  static of(
    content: UniversityResultDto[],
    hasNext: boolean,
  ): SearchUniversitiesResponseDto {
    const response = new SearchUniversitiesResponseDto();
    response.content = content.map((university) => ({
      id: university.id,
      name: university.name,
      country: university.country,
    }));
    response.hasNext = hasNext;
    return response;
  }
}
