import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UserAgreementRepository } from './user-agreement.repository';
import { BaseEntity } from '../../common/base.entity';

@Entity({ repository: () => UserAgreementRepository })
export class UserAgreement extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  userId!: number;

  @Property()
  termsId!: number;

  @Property()
  agreedAt: Date = new Date();
}