import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UniversityService } from './university.service';
import { SearchUniversitiesRequestDto } from './dto/search-universities-request.dto';
import { SearchUniversitiesResponseDto } from './dto/search-universities-response.dto';
import { ErrorResponse } from '../common/error-response';

@ApiTags('대학교')
@ApiBearerAuth()
@Controller({
  path: 'universities',
  version: '1',
})
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
    const { name, pageNumber = 1, pageSize = 10 } = query;

    const { universities, hasNext } =
      await this.universityService.searchUniversities(
        name,
        pageNumber,
        pageSize,
      );

    return SearchUniversitiesResponseDto.of(universities, hasNext);
  }
}
