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
import { PageRequest } from '@app/common';
import { JwtAuthGuard, CurrentUser, UserTokenInfo } from '@app/auth';
import { UniversityService } from '../application/university.service';
import { SearchUniversitiesRequestDto } from './dto/search-universities.request.dto';
import { SearchUniversitiesResponseDto } from './dto/search-universities.response.dto';
import { SendVerificationCodeRequestDto } from './dto/send-verification-code.request.dto';
import { SendVerificationCodeResponseDto } from './dto/send-verification-code.response.dto';

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
    const universitySlice = await this.universityService.searchUniversities({
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
}
