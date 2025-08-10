import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CountryCode } from '@app/database/common/enums';
import { PageRequest } from '@app/common';

export class SearchRegionDto extends PageRequest {
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

  constructor() {
    super();
    this.pageSize = 20;
  }
}
