import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class SaveInterestRegionsDto {
  @ApiProperty({
    description: '관심지역으로 설정할 지역 ID 목록',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  regionIds: number[];

  @ApiProperty({
    description: '기본 관심지역으로 설정할 지역 ID (옵셔널 값)',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  primaryRegionId?: number;
}
