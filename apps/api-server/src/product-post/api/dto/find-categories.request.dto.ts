import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindCategoriesRequestDto {
  @ApiPropertyOptional({
    description: '지역 ID (옵셔널)',
    example: '010101',
  })
  @IsOptional()
  @IsString()
  regionId?: string;
}
