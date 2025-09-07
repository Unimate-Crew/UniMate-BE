import { Migration } from '@mikro-orm/migrations';

export class Migration20250429105815 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`user\` add unique \`user_nickname_unique\`(\`nickname\`);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` drop index \`user_nickname_unique\`;`);
  }
}
