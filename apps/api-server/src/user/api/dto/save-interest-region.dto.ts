import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SaveInterestRegionDto {
  @ApiProperty({
    description: '저장할 지역 ID',
    example: '11110',
  })
  @IsString()
  regionId: string;
}
