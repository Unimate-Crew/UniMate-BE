import { PageRequest } from '@app/common';

export class FindMyPurchasesRequestDto extends PageRequest {
  // 구매내역 조회는 항상 COMPLETED 상태만 조회하므로 별도 필터 없음
}
