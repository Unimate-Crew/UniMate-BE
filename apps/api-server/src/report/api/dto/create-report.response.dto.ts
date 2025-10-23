import { ApiProperty } from '@nestjs/swagger';
import { CreateReportResultDto } from '../../application/dto/create-report.result.dto';

export class CreateReportResponseDto {
  @ApiProperty({
    description: '생성된 신고 ID',
    example: 1,
  })
  reportId!: number;

  @ApiProperty({
    description: '유저 자동 차단 여부',
    example: true,
  })
  userBlocked: boolean;

  private constructor(reportId: number, userBlocked: boolean) {
    this.reportId = reportId;
    this.userBlocked = userBlocked;
  }

  public static from(result: CreateReportResultDto): CreateReportResponseDto {
    return new CreateReportResponseDto(result.reportId, result.userBlocked);
  }
}
