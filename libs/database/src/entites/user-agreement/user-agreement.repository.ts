import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { UserAgreement } from './user-agreement.entity';

@Injectable()
export class UserAgreementRepository extends EntityRepository<UserAgreement> {
  async findById(id: number): Promise<UserAgreement | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByUserId(userId: number): Promise<UserAgreement[]> {
    return this.find(
      { userId, isDeleted: false },
      { orderBy: { agreedAt: 'DESC' } },
    );
  }

  async findByUserIdAndTermsId(
    userId: number,
    termsId: number,
  ): Promise<UserAgreement | null> {
    return this.findOne({
      userId,
      termsId,
      isDeleted: false,
    });
  }

  async persist(userAgreement: UserAgreement): Promise<void> {
    await this.em.persist(userAgreement);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(userAgreement: UserAgreement): Promise<void> {
    await this.em.persistAndFlush(userAgreement);
  }

  /**
   * 특정 사용자의 모든 약관 동의 이력을 소프트 딜리트 처리합니다.
   * @param userId 사용자 ID
   * @returns 업데이트된 행 수
   */
  async softDeleteByUserId(userId: number): Promise<number> {
    return this.nativeUpdate(
      { userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
  }
}