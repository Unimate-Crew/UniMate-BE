import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { TradeProgress } from './trade-progress.entity';

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
}
