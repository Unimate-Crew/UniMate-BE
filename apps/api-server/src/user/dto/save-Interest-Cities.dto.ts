import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsNumber } from 'class-validator';

export class SaveInterestCitiesDto {
  @ApiProperty({
    description: '사용자가 선택한 관심도시 ID 목록 (최대 3개)',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(3, { message: '관심도시는 최대 3개까지 선택 가능합니다.' })
  cityIds: number[];
}
