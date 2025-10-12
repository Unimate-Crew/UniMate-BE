import { Migration } from '@mikro-orm/migrations';

export class Migration20251011221231 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`trade_progress\` add \`conversation_id\` int not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`trade_progress\` drop column \`conversation_id\`;`,
    );
  }
}
