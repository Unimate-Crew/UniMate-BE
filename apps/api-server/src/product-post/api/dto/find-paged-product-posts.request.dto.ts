import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequest } from '@app/common';

export class FindPagedProductPostsRequestDto extends PageRequest {
  @ApiProperty({
    description: '필터링할 지역 ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  regionId: number;
}
