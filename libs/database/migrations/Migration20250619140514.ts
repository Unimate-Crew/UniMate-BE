import { Migration } from '@mikro-orm/migrations';

export class Migration20250619140514 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table \`region\` modify \`country_code\` enum('US');`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`region\` modify \`country_code\` varchar(255);`);
  }
}
