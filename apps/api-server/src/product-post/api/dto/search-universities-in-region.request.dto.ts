import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from '@app/common';

export class SearchUniversitiesInRegionRequestDto extends PageRequest {
  @ApiProperty({
    description: '검색 키워드 (대학교 이름 기준)',
    example: 'Harvard',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchKeyword?: string;
}
