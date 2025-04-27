import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Country } from '../../common/enums';

export class SearchUniversitiesRequestDto {
  @ApiProperty({
    description: '대학교 이름 검색 키워드',
    example: 'Harvard',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    default: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageNumber?: number = 1;

  @ApiProperty({
    description: '페이지 크기',
    example: 10,
    default: 10,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;
}
