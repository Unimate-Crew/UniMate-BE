import { Injectable, NotFoundException } from '@nestjs/common';
import { Region } from '@app/database/entites/region/region.entity';
import { PagedResult } from '@app/common';
import { RegionRepository } from '@app/database';
import { RegionInfo, RegionListResponse } from './dto/region-response.dto';
import { SearchRegionDto } from './dto/search-region.dto';

@Injectable()
export class RegionService {
  constructor(private readonly regionRepository: RegionRepository) {}

  async searchRegions(
    searchRegionDto: SearchRegionDto,
  ): Promise<RegionListResponse> {
    const {
      name,
      countryCode,
      pageNumber = 1,
      pageSize = 20,
    } = searchRegionDto;

    const result: PagedResult<Region> =
      await this.regionRepository.findByNameAndCountryCodeLike(
        pageNumber,
        pageSize,
        name,
        countryCode,
      );

    return RegionListResponse.fromPagedResult(result);
  }

  async getRegionById(id: number): Promise<RegionInfo> {
    const region = await this.regionRepository.findOne({ id } as any, {
      populate: { state: true, county: true } as any,
    });

    if (!region) {
      throw new NotFoundException(`ID가 '${id}'인 지역을 찾을 수 없습니다.`);
    }

    return RegionInfo.from(region);
  }
}
