import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequest } from '@app/common';

export class FindPagedProductPostsRequestDto extends PageRequest {
  @ApiProperty({
    description: '필터링할 지역 ID',
    example: 1,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  regionId: string;
}
