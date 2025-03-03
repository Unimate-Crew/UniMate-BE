import { EntityRepository } from '@mikro-orm/mysql';
import { User } from '../entity/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends EntityRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }
  
} 