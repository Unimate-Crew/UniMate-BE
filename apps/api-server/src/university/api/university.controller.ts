import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PageRequest, Slice } from '@app/common';
import { JwtAuthGuard, CurrentUser, UserTokenInfo } from '@app/auth';
import { UniversityService } from '../application/university.service';
import { SearchUniversitiesRequestDto } from './dto/search-universities.request.dto';
import { SearchUniversitiesResponseDto } from './dto/search-universities.response.dto';
import { SendVerificationCodeRequestDto } from './dto/send-verification-code.request.dto';
import { SendVerificationCodeResponseDto } from './dto/send-verification-code.response.dto';
import { VerifyUniversityEmailRequestDto } from './dto/verify-university-email.request.dto';
import { VerifyUniversityEmailResponseDto } from './dto/verify-university-email.response.dto';
import { UniversityResultDto } from '../application/dto/university.result.dto';
import { VerifyUniversityEmailResultDto } from '../application/dto/verify-university-email.result.dto';

@ApiTags('대학교')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'universities' })
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Get('/search')
  @ApiOperation({
    summary: '대학교 검색 API',
    description: '대학교 이름으로 검색하고 국가별로 필터링할 수 있는 API',
  })
  @ApiResponse({
    status: 200,
    description: '대학교 검색 성공',
    type: SearchUniversitiesResponseDto,
  })
  async searchUniversities(
    @Query() query: SearchUniversitiesRequestDto,
  ): Promise<SearchUniversitiesResponseDto> {
    const universitySlice: Slice<UniversityResultDto> =
      await this.universityService.searchUniversities({
        name: query.name,
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
      });

    return SearchUniversitiesResponseDto.of(
      universitySlice.contents,
      universitySlice.hasNext,
    );
  }

  @Post('/email-verifications')
  @ApiOperation({
    summary: '대학교 이메일 인증코드 발송 API',
    description:
      '대학교 이메일로 6자리 인증코드를 발송합니다. 인증코드는 10분간 유효합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '인증코드 발송 성공',
    type: SendVerificationCodeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '등록되지 않은 대학교 도메인',
  })
  async sendVerificationCode(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: SendVerificationCodeRequestDto,
  ): Promise<SendVerificationCodeResponseDto> {
    const expiresInSeconds: number =
      await this.universityService.sendVerificationCode(
        userTokenInfo.userId,
        requestDto.email,
      );

    return SendVerificationCodeResponseDto.of(expiresInSeconds);
  }

  @Post('/email-verifications/verify')
  @HttpCode(200)
  @ApiOperation({
    summary: '대학교 이메일 인증코드 검증 API',
    description: '인증코드를 검증하고 사용자의 대학교 정보를 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 성공',
    type: VerifyUniversityEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '인증코드 불일치',
    schema: {
      properties: {
        code: { type: 'string', example: 'UN005' },
        message: { type: 'string', example: '인증코드가 일치하지 않습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '인증코드를 찾을 수 없거나 만료됨',
    schema: {
      properties: {
        code: { type: 'string', example: 'UN004' },
        message: {
          type: 'string',
          example: '인증코드를 찾을 수 없거나 만료되었습니다.',
        },
      },
    },
  })
  async verifyUniversityEmail(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: VerifyUniversityEmailRequestDto,
  ): Promise<VerifyUniversityEmailResponseDto> {
    const result: VerifyUniversityEmailResultDto =
      await this.universityService.verifyUniversityEmail(
        userTokenInfo.userId,
        requestDto.code,
      );

    return VerifyUniversityEmailResponseDto.of(
      result.universityId,
      result.universityEmail,
    );
  }
}
