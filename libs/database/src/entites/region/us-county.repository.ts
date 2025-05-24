import { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import type { UsCounty } from './us-county.entity';

@Injectable()
export class UsCountyRepository extends EntityRepository<UsCounty> {}
