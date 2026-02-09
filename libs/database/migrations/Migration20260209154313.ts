import { Migration } from '@mikro-orm/migrations';

export class Migration20260209154313 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`terms\` modify \`url\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`terms\` modify \`url\` varchar(255) not null;`);
  }

}
