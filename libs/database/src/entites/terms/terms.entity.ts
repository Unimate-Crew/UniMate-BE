import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { TermsRepository } from './terms.repository';
import { BaseEntity } from '../../common/base.entity';
import { TermsType } from '../../common/enums';

@Entity({ repository: () => TermsRepository })
export class Terms extends BaseEntity {
  @PrimaryKey()
  id!: number;

  @Enum(() => TermsType)
  type!: TermsType;

  @Property()
  title!: string;

  @Property({ nullable: true })
  url?: string;

  @Property({ default: true })
  isRequired: boolean = true;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: 1 })
  displayOrder: number = 1;
}
