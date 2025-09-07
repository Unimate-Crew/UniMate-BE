import { Migration } from '@mikro-orm/migrations';

export class Migration20250527155057 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`product_post\` modify \`region_id\` varchar(255) not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`product_post\` modify \`region_id\` int not null;`,
    );
  }
}
