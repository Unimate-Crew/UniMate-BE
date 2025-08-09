import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CountryCode } from '@app/database/common/enums';

export class SearchRegionsParamsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(CountryCode)
  countryCode?: CountryCode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  static of(
    name?: string,
    countryCode?: CountryCode,
    page?: number,
    limit?: number,
  ): SearchRegionsParamsDto {
    const params = new SearchRegionsParamsDto();
    params.name = name;
    params.countryCode = countryCode;
    params.page = page || 1;
    params.limit = limit || 20;
    return params;
  }
}
