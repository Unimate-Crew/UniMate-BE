import { Migration } from '@mikro-orm/migrations';

export class Migration20250705012501 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` drop column \`name\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` add \`name\` varchar(255) not null;`);
  }

}
