import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional } from 'class-validator';

export class SaveInterestRegionsDto {
  @ApiProperty({
    description: '관심지역으로 설정할 지역 ID 목록',
    example: ['11110', '11140'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  regionIds: string[];

  @ApiProperty({
    description: '기본 관심지역으로 설정할 지역 ID (옵셔널 값)',
    example: '11110',
    required: false,
  })
  @IsString()
  @IsOptional()
  primaryRegionId?: string;
}
