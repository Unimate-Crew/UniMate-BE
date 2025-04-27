import { Migration } from '@mikro-orm/migrations';

export class Migration20250427101102 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` drop column \`test\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` add \`test\` varchar(255) null;`);
  }

}
