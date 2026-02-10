import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TermsService } from '../application/terms.service';
import { GetTermsResponseDto } from './dto/get-terms-response.dto';
import { TermsResultDto } from '../application/dto/get-terms-result.dto';

@ApiTags('약관')
@Controller({ path: 'terms' })
export class TermsController {
  constructor(private readonly termsService: TermsService) {}

  @ApiOperation({
    summary: '약관 목록 조회',
    description: '회원가입 시 동의해야 할 약관 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '약관 목록 조회 성공',
    type: GetTermsResponseDto,
  })
  @Get()
  async getTerms(): Promise<GetTermsResponseDto> {
    const termsResult: TermsResultDto[] =
      await this.termsService.getActiveTerms();
    return GetTermsResponseDto.of(termsResult);
  }
}
