import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, ArrayUnique } from 'class-validator';

export class SaveUserAgreementsRequestDto {
  @ApiProperty({
    description: '동의한 약관 ID 목록',
    example: [1, 2, 3],
    required: true,
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 약관에 동의해야 합니다.' })
  @ArrayUnique({ message: '중복된 약관이 포함되어 있습니다.' })
  termsIds!: number[];
}
