import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PageRequest } from '@app/common';
import { JwtAuthGuard } from '@app/auth';
import { UniversityService } from '../application/university.service';
import { SearchUniversitiesRequestDto } from './dto/search-universities.request.dto';
import { SearchUniversitiesResponseDto } from './dto/search-universities.response.dto';

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
}
