import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchCityDto {
  @ApiProperty({ description: '도시 이름', required: true })
  @IsString()
  name: string;

  @ApiProperty({ description: '페이지 번호', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
