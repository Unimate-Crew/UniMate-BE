import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';
import { ReportReason } from '@app/database/common/enums';

export class CreateReportRequestDto {
  @ApiProperty({
    description: '신고 대상 유저 ID',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  targetUserId!: number;

  @ApiProperty({
    description: '신고 이유',
    enum: ReportReason,
    example: ReportReason.BAD_MANNER,
  })
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason!: ReportReason;

  @ApiProperty({
    description: '신고 내용 (공백 포함 300자 제한)',
    example: '상품 설명과 다른 물건을 판매하려고 했습니다.',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300, { message: '신고 내용은 300자 이내로 작성해주세요.' })
  detail!: string;
}
