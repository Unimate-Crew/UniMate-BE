import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPriceRangeRequestDto {
  @ApiProperty({
    description: '검색 키워드 (제목 기준)',
    example: '자전거',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchKeyword?: string;
}
