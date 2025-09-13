import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { MySalesFilter } from '@app/database/common/enums';
import { PageRequest } from '@app/common';

export class FindMySalesRequestDto extends PageRequest {
  @ApiProperty({
    description: '판매내역 필터',
    enum: MySalesFilter,
    example: MySalesFilter.FOR_SALE,
    required: false,
  })
  @IsEnum(MySalesFilter)
  @IsOptional()
  mySalesFilter?: MySalesFilter;
}
