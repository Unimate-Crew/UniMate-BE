import { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import type { UsState } from './us-state.entity';

@Injectable()
export class UsStateRepository extends EntityRepository<UsState> {}
