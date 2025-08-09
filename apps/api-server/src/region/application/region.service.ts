import { Injectable, NotFoundException } from '@nestjs/common';
import { Region } from '@app/database/entites/region/region.entity';
import { PagedResult } from '@app/common';
import { RegionRepository } from '@app/database';
import { SearchRegionsParamsDto } from './dto/search-regions-params.dto';
import { SearchRegionsResultDto } from './dto/search-regions-result.dto';
import { GetRegionByIdResultDto } from './dto/get-region-by-id-result.dto';

@Injectable()
export class RegionService {
  constructor(private readonly regionRepository: RegionRepository) {}

  async searchRegions(
    params: SearchRegionsParamsDto,
  ): Promise<SearchRegionsResultDto> {
    const result: PagedResult<Region> =
      await this.regionRepository.findByNameAndCountryCodeLike(
        params.page,
        params.limit,
        params.name,
        params.countryCode,
      );

    return SearchRegionsResultDto.fromPagedResult(result);
  }

  async getRegionById(id: string): Promise<GetRegionByIdResultDto> {
    const region = await this.regionRepository.findOne({ id } as any, {
      populate: { state: true, county: true } as any,
    });

    if (!region) {
      throw new NotFoundException(`ID가 '${id}'인 지역을 찾을 수 없습니다.`);
    }

    return GetRegionByIdResultDto.from(region);
  }
}
