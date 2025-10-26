import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { PageRequest, Slice } from '@app/common';
import { TradeProgress } from './trade-progress.entity';
import { TradeProgressStatus } from '../../common/enums';

@Injectable()
export class TradeProgressRepository extends EntityRepository<TradeProgress> {
  /**
   * ID로 거래 진행 정보를 조회합니다.
   */
  async findById(id: number): Promise<TradeProgress | null> {
    return this.findOne({ id, isDeleted: false });
  }

  /**
   * 상품 게시글의 거래 진행 정보를 조회합니다.
   */
  async findByProductPostId(
    productPostId: number,
  ): Promise<TradeProgress | null> {
    return this.findOne({ productPostId, isDeleted: false });
  }

  /**
   * 상품 게시글과 구매자로 거래 진행 정보를 조회합니다.
   */
  async findByProductPostIdAndBuyerId(params: {
    productPostId: number;
    buyerId: number;
  }): Promise<TradeProgress | null> {
    return this.findOne({
      productPostId: params.productPostId,
      buyerId: params.buyerId,
      isDeleted: false,
    });
  }

  /**
   * 거래 진행 정보를 소프트 삭제합니다.
   */
  async softDelete(tradeProgress: TradeProgress): Promise<void> {
    tradeProgress.delete();
    await this.persistAndFlush(tradeProgress);
  }

  async persist(tradeProgress: TradeProgress): Promise<void> {
    await this.em.persist(tradeProgress);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(tradeProgress: TradeProgress): Promise<void> {
    await this.em.persistAndFlush(tradeProgress);
  }

  /**
   * 구매 완료된 거래 내역을 페이지네이션하여 조회합니다.
   * 최근 구매순(updatedAt DESC)으로 정렬됩니다.
   *
   * @param params.pageRequest 페이지네이션 정보
   * @param params.userId 구매자 ID
   * @returns 구매 완료된 거래 내역 Slice
   */
  async findPagedPurchaseHistories(params: {
    pageRequest: PageRequest;
    userId: number;
  }): Promise<Slice<TradeProgress>> {
    const tradeProgresses = await this.find(
      {
        buyerId: params.userId,
        status: TradeProgressStatus.COMPLETED,
        isDeleted: false,
      },
      {
        orderBy: { updatedAt: 'DESC' },
        limit: params.pageRequest.getLimit() + 1,
        offset: params.pageRequest.getOffset(),
      },
    );

    const hasNext = tradeProgresses.length > params.pageRequest.getLimit();
    const contents = hasNext ? tradeProgresses.slice(0, -1) : tradeProgresses;

    return Slice.of(contents, hasNext);
  }
}
