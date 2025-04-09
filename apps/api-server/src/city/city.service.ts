import { Injectable, NotFoundException } from '@nestjs/common';
import { UsCity } from 'libs/database/src/entites/city/us-city.entity';
import { PagedResult } from '@app/common';
import { UsCityRepository } from '@app/database';
import { CityInfo, CityListResponse } from './dto/city-response.dto';
import { SearchCityDto } from './dto/search-city.dto';

@Injectable()
export class CityService {
  constructor(private readonly cityRepository: UsCityRepository) {}

  async searchCities(searchCityDto: SearchCityDto): Promise<CityListResponse> {
    const { name, page = 1, limit = 20 } = searchCityDto;

    // 커스텀 리포지토리 메서드 사용
    const result: PagedResult<UsCity> =
      await this.cityRepository.findByNameLike(name, page, limit);

    // 정적 팩토리 메서드를 사용하여 응답 생성
    return CityListResponse.fromPagedResult(result);
  }

  async getCityByGeoid(geoid: string): Promise<CityInfo> {
    const city = await this.cityRepository.findOne({ geoid } as any, {
      populate: { state: true, county: true } as any,
    });

    if (!city) {
      throw new NotFoundException(
        `GEOID가 '${geoid}'인 도시를 찾을 수 없습니다.`,
      );
    }

    return CityInfo.from(city);
  }
}
