import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { SearchCityDto } from './dto/search-city.dto';
import { CityInfo, CityListResponse } from './dto/city-response.dto';

@ApiTags('도시')
@Controller({
  path: 'cities',
  version: '1',
})
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get('search')
  @ApiOperation({
    summary: '도시 검색',
    description:
      '도시 이름으로 도시를 검색합니다. 간단한 페이지네이션을 지원합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '도시 정보 목록',
    type: CityListResponse,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchCities(
    @Query() searchCityDto: SearchCityDto,
  ): Promise<CityListResponse> {
    return this.cityService.searchCities(searchCityDto);
  }

  @Get(':geoid')
  @ApiOperation({
    summary: '도시 상세 정보',
    description: 'GEOID로 도시 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '도시 상세 정보',
    type: CityInfo,
  })
  @ApiResponse({ status: 404, description: '도시를 찾을 수 없음' })
  async getCityByGeoid(@Param('geoid') geoid: string): Promise<CityInfo> {
    return this.cityService.getCityByGeoid(geoid);
  }
}
