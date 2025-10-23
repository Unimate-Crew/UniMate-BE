import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { ReportService } from '../application/report.service';
import { ErrorResponse } from '../../common/error-response';
import { CreateReportRequestDto } from './dto/create-report.request.dto';
import { CreateReportResponseDto } from './dto/create-report.response.dto';
import { CreateReportResultDto } from '../application/dto/create-report.result.dto';

@ApiTags('유저 신고')
@Controller({ path: 'reports' })
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '유저 신고 API',
    description:
      '특정 유저를 신고합니다. 부적절한 성적 행위로 신고할 경우 해당 유저가 자동으로 차단됩니다.',
  })
  @ApiResponse({
    status: 201,
    description: '유저 신고 성공',
    type: CreateReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '본인 신고 불가',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'RP001',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '본인은 신고할 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '신고 대상 유저를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'RP003',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '신고 대상 유저를 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 신고한 유저',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'RP002',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '이미 신고한 유저입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async createReport(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: CreateReportRequestDto,
  ): Promise<CreateReportResponseDto> {
    const result: CreateReportResultDto = await this.reportService.createReport(
      {
        userId: userTokenInfo.userId,
        targetUserId: requestDto.targetUserId,
        reason: requestDto.reason,
        detail: requestDto.detail,
      },
    );

    return CreateReportResponseDto.from(result);
  }
}
