import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetPrimaryInterestRegionDto {
  @ApiProperty({
    description:
      '기본 관심지역으로 설정할 지역 ID (null인 경우 기본 관심지역 해제)',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsString({ message: '지역 ID는 문자열이어야 합니다.' })
  @IsOptional()
  regionId: string | null;
}
