import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class SetPrimaryInterestCityDto {
  @ApiProperty({
    description:
      '기본 관심도시로 설정할 도시 ID (null인 경우 기본 관심도시 해제)',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsInt({ message: '도시 ID는 정수여야 합니다.' })
  @IsOptional()
  cityId: number | null;
}
