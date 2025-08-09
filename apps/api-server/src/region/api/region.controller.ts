import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegionService } from '../application/region.service';
import { SearchRegionsRequestDto } from './dto/search-region.dto';
import { SearchRegionsResponseDto } from './dto/region-response.dto';
import { GetRegionByIdResponseDto } from './dto/get-region-by-id-response.dto';
import { SearchRegionsParamsDto } from '../application/dto/search-regions-params.dto';
import { SearchRegionsResultDto } from '../application/dto/search-regions-result.dto';
import { GetRegionByIdResultDto } from '../application/dto/get-region-by-id-result.dto';

@ApiTags('지역')
@Controller({ path: 'regions' })
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('search')
  @ApiOperation({
    summary: '지역 검색',
    description:
      '지역 이름으로 지역을 검색합니다. 국가 코드를 함께 제공하면 해당 국가의 지역만 검색합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '지역 정보 목록',
    type: SearchRegionsResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRegions(
    @Query() requestDto: SearchRegionsRequestDto,
  ): Promise<SearchRegionsResponseDto> {
    const params: SearchRegionsParamsDto = SearchRegionsParamsDto.of(
      requestDto.name,
      requestDto.countryCode,
      requestDto.page,
      requestDto.limit,
    );
    const result: SearchRegionsResultDto =
      await this.regionService.searchRegions(params);
    return SearchRegionsResponseDto.fromResult(result);
  }

  @Get(':id')
  @ApiOperation({
    summary: '지역 상세 정보',
    description: 'ID로 지역 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '지역 상세 정보',
    type: GetRegionByIdResponseDto,
  })
  @ApiResponse({ status: 404, description: '지역을 찾을 수 없음' })
  async getRegionById(
    @Param('id') id: string,
  ): Promise<GetRegionByIdResponseDto> {
    const result: GetRegionByIdResultDto =
      await this.regionService.getRegionById(id);
    return GetRegionByIdResponseDto.from(result);
  }
}
