import { Injectable } from '@nestjs/common';
import { Country } from '../common/enums';
import { UniversityDto } from './dto/search-universities-response.dto';

@Injectable()
export class UniversityService {
  // 실제로는 데이터베이스에서 조회하는 로직이 구현되어야 함
  async searchUniversities(
    name?: string,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{
    universities: UniversityDto[];
    hasNext: boolean;
    totalItems: number;
  }> {
    // 모의 데이터 (실제 구현 시 데이터베이스 조회 로직으로 대체)
    const mockUniversities: UniversityDto[] = [
      {
        id: 1,
        name: 'Harvard University',
        country: Country.USA,
      },
      {
        id: 2,
        name: 'Seoul National University',
        country: Country.KOREA,
      },
      {
        id: 3,
        name: 'Massachusetts Institute of Technology',
        country: Country.USA,
      },
      {
        id: 4,
        name: 'University of Oxford',
        country: Country.UK,
      },
      {
        id: 5,
        name: 'Kyoto University',
        country: Country.JAPAN,
      },
    ];

    // 필터링 조건 적용 (name과 country)
    let filteredUniversities = mockUniversities;

    if (name) {
      const lowerName = name.toLowerCase();
      filteredUniversities = filteredUniversities.filter((uni) =>
        uni.name.toLowerCase().includes(lowerName),
      );
    }

    // 페이지네이션 적용
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const totalItems = filteredUniversities.length;
    const pagedUniversities = filteredUniversities.slice(startIndex, endIndex);
    const hasNext = endIndex < totalItems;

    return {
      universities: pagedUniversities,
      hasNext,
      totalItems,
    };
  }
}
