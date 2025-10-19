import { Migration } from '@mikro-orm/migrations';

export class Migration20251019103048 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`update_popup\` add \`update_type\` enum('FORCE', 'RECOMMEND') not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`update_popup\` drop column \`update_type\`;`);
  }

}
