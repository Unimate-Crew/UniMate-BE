import { ApiProperty } from '@nestjs/swagger';
import { UniversityItemDto } from './university-item.dto';
import { UniversityResultDto } from '../../application/dto/university-result.dto';

export class SearchUniversitiesInRegionResponseDto {
  @ApiProperty({
    description: '대학교 목록',
    type: [UniversityItemDto],
  })
  contents: UniversityItemDto[];

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNext: boolean;

  constructor(contents: UniversityItemDto[], hasNext: boolean) {
    this.contents = contents;
    this.hasNext = hasNext;
  }

  static of(
    contents: UniversityResultDto[],
    hasNext: boolean,
  ): SearchUniversitiesInRegionResponseDto {
    const universities: UniversityItemDto[] = contents.map(
      (university) =>
        new UniversityItemDto(
          university.id,
          university.name,
          university.country,
        ),
    );

    return new SearchUniversitiesInRegionResponseDto(universities, hasNext);
  }
}
