import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class SetPrimaryInterestRegionDto {
  @ApiProperty({
    description:
      '기본 관심지역으로 설정할 지역 ID (null인 경우 기본 관심지역 해제)',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsInt({ message: '지역 ID는 정수여야 합니다.' })
  @IsOptional()
  regionId: number | null;
}
