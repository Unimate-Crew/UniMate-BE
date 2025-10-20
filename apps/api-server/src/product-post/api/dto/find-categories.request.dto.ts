import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FindCategoriesRequestDto {
  @ApiPropertyOptional({
    description: '지역 ID (옵셔널)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  regionId?: number;
}
