import { Injectable } from '@nestjs/common';
import { Slice } from '@app/common/utils/pagination';
import { Country } from '../../common/enums';
import { UniversityInfo } from './dto/university.info';

@Injectable()
export class UniversityService {
  // 실제로는 데이터베이스에서 조회하는 로직이 구현되어야 함
  async searchUniversities(params: {
    name?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Slice<UniversityInfo>> {
    const { name, pageNumber = 1, pageSize = 10 } = params;

    // 모의 데이터 (실제 구현 시 데이터베이스 조회 로직으로 대체)
    const mockUniversities: UniversityInfo[] = [
      new UniversityInfo(1, 'Harvard University', Country.USA),
      new UniversityInfo(2, 'Seoul National University', Country.KOREA),
      new UniversityInfo(
        3,
        'Massachusetts Institute of Technology',
        Country.USA,
      ),
      new UniversityInfo(4, 'University of Oxford', Country.UK),
      new UniversityInfo(5, 'Kyoto University', Country.JAPAN),
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

    return Slice.of(pagedUniversities, hasNext);
  }
}
