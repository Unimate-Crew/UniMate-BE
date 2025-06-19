import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CountryCode } from '@app/database/common/enums';

export class SearchRegionDto {
  @ApiProperty({ description: '지역 이름', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '국가 코드 (ISO 3166-1 alpha-2)',
    enum: CountryCode,
    required: false,
    example: 'US',
  })
  @IsOptional()
  @IsEnum(CountryCode)
  countryCode?: CountryCode;

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
