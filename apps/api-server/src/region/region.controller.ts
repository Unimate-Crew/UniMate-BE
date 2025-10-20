import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegionService } from './region.service';
import { SearchRegionDto } from './dto/search-region.dto';
import { RegionInfo, RegionListResponse } from './dto/region-response.dto';

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
    type: RegionListResponse,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchRegions(
    @Query() searchRegionDto: SearchRegionDto,
  ): Promise<RegionListResponse> {
    return this.regionService.searchRegions(searchRegionDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '지역 상세 정보',
    description: 'ID로 지역 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '지역 상세 정보',
    type: RegionInfo,
  })
  @ApiResponse({ status: 404, description: '지역을 찾을 수 없음' })
  async getRegionById(@Param('id', ParseIntPipe) id: number): Promise<RegionInfo> {
    return this.regionService.getRegionById(id);
  }
}
