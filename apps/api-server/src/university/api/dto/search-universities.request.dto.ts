import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageRequest } from '@app/common';

export class SearchUniversitiesRequestDto extends PageRequest {
  @ApiProperty({
    description: '대학교 이름 (검색 키워드)',
    example: 'Harvard',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
