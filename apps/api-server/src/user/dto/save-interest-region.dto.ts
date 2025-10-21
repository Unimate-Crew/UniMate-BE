import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SaveInterestRegionDto {
  @ApiProperty({
    description: '저장할 지역 ID',
    example: 1,
  })
  @IsNumber()
  regionId: number;
}
