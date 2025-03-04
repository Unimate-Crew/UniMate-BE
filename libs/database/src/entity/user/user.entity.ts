import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UserRepository } from './user.repository';

@Entity({ repository: () => UserRepository })
export class User {

   @PrimaryKey()
   id!: number;

   @Property()
   email!: string;

   @Property()
   name!: string;

   @Property()
   password!: string;

   @Property()
   createdAt: Date = new Date();

   @Property({ onUpdate: () => new Date() })
   updatedAt: Date = new Date();
}
